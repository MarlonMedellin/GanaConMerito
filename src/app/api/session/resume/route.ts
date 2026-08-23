import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { selectNextItem } from "@/domain/item-selection/select-next-item";
import { V4QuestionRepository } from "@/lib/question-bank/v4-question-repository";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import {
  getCanarySessionTargetingContext,
  getCanarySessionTargetingCookieName,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";

const TERMINAL_STATES = new Set(["session_close", "expired", "error"]);

export async function GET(request: Request) {
  const observation = beginRequestObservation(request, "/api/session/resume");
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    logRequestOutcome(observation, {
      event: "canary.session_resume.auth_failed",
      status: auth.status,
      errorCode: API_ERROR_CODES.AUTH_UNAUTHORIZED,
    });
    return jsonWithRequestId({ error: auth.error }, auth.status, observation);
  }

  const { supabase, profile } = auth;
  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("professional_profile_id")
    .eq("profile_id", profile.id)
    .single();
  if (learningProfileError || !learningProfile) {
    logRequestOutcome(observation, {
      event: "canary.session_resume.learning_profile_missing",
      status: 404,
      errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
      error: learningProfileError,
    });
    return jsonWithRequestId({ error: "Learning profile not found" }, 404, observation);
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, mode, current_state, status, created_at")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    logRequestOutcome(observation, {
      event: "canary.session_resume.session_lookup_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      error: sessionError,
    });
    return jsonWithRequestId({ error: "Could not inspect active sessions" }, 500, observation);
  }

  if (!session || TERMINAL_STATES.has(session.current_state)) {
    logRequestOutcome(observation, {
      event: "canary.session_resume.none",
      status: 200,
    });
    const response = jsonWithRequestId({ session: null }, 200, observation);
    if (isCanaryTargetingEnabled()) {
      response.cookies.delete(getCanarySessionTargetingCookieName());
    }
    return response;
  }

  let canaryTargeting = null;
  if (isCanaryTargetingEnabled()) {
    let sessionTargeting;
    try {
      sessionTargeting = await getCanarySessionTargetingContext();
    } catch (error) {
      logRequestOutcome(observation, {
        event: "canary.session_resume.catalog_invalid",
        status: 500,
        errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
        sessionId: session.id,
        error,
      });
      return jsonWithRequestId({ error: "Canary targeting catalog is not valid." }, 500, observation);
    }

    if (!sessionTargeting || sessionTargeting.sessionId !== session.id) {
      logRequestOutcome(observation, {
        event: "canary.session_resume.session_targeting_missing",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
        sessionId: session.id,
      });
      return jsonWithRequestId(
        { error: "La sesión activa perdió su contexto de OPEC. Inicia una nueva práctica canary." },
        409,
        observation,
      );
    }

    canaryTargeting = sessionTargeting.selection;
    const { data: selectedProfile } = await supabase
      .from("professional_profiles")
      .select("code")
      .eq("id", learningProfile.professional_profile_id)
      .maybeSingle();
    if (!selectedProfile || selectedProfile.code !== canaryTargeting.professionalProfileCode) {
      logRequestOutcome(observation, {
        event: "canary.session_resume.targeting_profile_drift",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
        sessionId: session.id,
        opecKey: canaryTargeting.opecKey,
      });
      return jsonWithRequestId(
        { error: "La selección de perfil y OPEC ya no coincide. Revisa el onboarding antes de continuar." },
        409,
        observation,
      );
    }
  }

  const { data: turns, error: turnsError } = await supabase
    .from("session_turns")
    .select("item_id, turn_number")
    .eq("session_id", session.id)
    .order("turn_number", { ascending: true });
  if (turnsError) {
    logRequestOutcome(observation, {
      event: "canary.session_resume.turns_lookup_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      sessionId: session.id,
      error: turnsError,
    });
    return jsonWithRequestId({ error: "Could not inspect session turns" }, 500, observation);
  }

  const seenItemIds = (turns ?? []).map((turn) => turn.item_id).filter(Boolean) as string[];
  let activeArea: string | undefined;
  let activeCompetency: string | undefined;

  if (seenItemIds.length > 0) {
    const repository = new V4QuestionRepository();
    const lastAnswered = await repository.getAnsweredQuestion(seenItemIds[seenItemIds.length - 1]);
    activeArea = lastAnswered?.area ?? undefined;
    activeCompetency = lastAnswered?.competency ?? undefined;
  }

  const nextItem = await selectNextItem({
    professionalProfileId: learningProfile.professional_profile_id,
    profileIdForRotation: profile.id,
    sessionIdForRotation: turns?.length ? session.id : undefined,
    activeArea,
    activeCompetency,
    canaryOpecId: canaryTargeting?.opecKey,
    excludeItemIds: seenItemIds,
  });

  const response = {
    session: {
      sessionId: session.id,
      currentState: session.current_state,
      mode: session.mode,
      currentItemId: nextItem?.id,
      hintLevel: 0,
      resumed: true,
      inventory: !nextItem
        ? {
            status: "empty" as const,
            reason: "no_active_v4_items" as const,
            alternatives: [
              "Revisar el inventario activo compatible con la OPEC seleccionada",
              "Iniciar una nueva sesión cuando exista inventario disponible",
            ],
          }
        : undefined,
    },
  };

  logRequestOutcome(observation, {
    event: "canary.session_resume.completed",
    status: 200,
    sessionId: session.id,
    itemId: nextItem?.id,
    opecKey: canaryTargeting?.opecKey,
    extra: { turnCount: turns?.length ?? 0, nextItemAvailable: Boolean(nextItem) },
  });
  return jsonWithRequestId(response, 200, observation);
}
