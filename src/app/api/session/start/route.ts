import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { selectNextItem } from "../../../../domain/item-selection/select-next-item";
import { isLearningProfileOnboardingComplete } from "../../../../lib/onboarding/status";
import { requireAuthenticatedProfile } from "../../../../lib/supabase/guards";
import {
  buildCanarySessionTargetingCookieValue,
  getCanarySessionTargetingCookieName,
  getCanaryTargetingSelection,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";
import { startSessionSchema } from "../../../../lib/validation/session";
import type { StartSessionResponse, SessionState } from "../../../../types/session";

export async function POST(request: Request) {
  const observation = beginRequestObservation(request, "/api/session/start");
  let json: unknown;
  try {
    json = await request.json();
  } catch (error) {
    logRequestOutcome(observation, {
      event: "canary.session_start.invalid_json",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_JSON,
      error,
    });
    return jsonWithRequestId({ error: "Invalid session start payload" }, 400, observation);
  }

  const parsedBody = startSessionSchema.safeParse(json);
  if (!parsedBody.success) {
    logRequestOutcome(observation, {
      event: "canary.session_start.invalid_body",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
    });
    return jsonWithRequestId(
      { error: parsedBody.error.issues.map((issue) => issue.message).join(" | ") },
      400,
      observation,
    );
  }

  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    logRequestOutcome(observation, {
      event: "canary.session_start.auth_failed",
      status: auth.status,
      errorCode: API_ERROR_CODES.AUTH_UNAUTHORIZED,
    });
    return jsonWithRequestId({ error: auth.error }, auth.status, observation);
  }

  const { supabase, profile } = auth;
  const body = parsedBody.data;
  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, professional_profile_id, active_areas")
    .eq("profile_id", profile.id)
    .single();

  if (learningProfileError || !learningProfile) {
    logRequestOutcome(observation, {
      event: "canary.session_start.learning_profile_missing",
      status: 404,
      errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
      error: learningProfileError,
    });
    return jsonWithRequestId({ error: "Learning profile not found" }, 404, observation);
  }

  let canaryTargeting = null;
  if (isCanaryTargetingEnabled()) {
    try {
      canaryTargeting = await getCanaryTargetingSelection();
    } catch (error) {
      logRequestOutcome(observation, {
        event: "canary.session_start.catalog_invalid",
        status: 500,
        errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
        error,
      });
      return jsonWithRequestId({ error: "Canary targeting catalog is not valid." }, 500, observation);
    }

    if (!canaryTargeting) {
      logRequestOutcome(observation, {
        event: "canary.session_start.targeting_required",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
      });
      return jsonWithRequestId(
        { error: "Debes seleccionar un perfil, cargo oficial y OPEC verificada antes de iniciar la práctica." },
        409,
        observation,
      );
    }

    const { data: selectedProfile } = await supabase
      .from("professional_profiles")
      .select("code")
      .eq("id", learningProfile.professional_profile_id)
      .maybeSingle();

    if (!selectedProfile || selectedProfile.code !== canaryTargeting.professionalProfileCode) {
      logRequestOutcome(observation, {
        event: "canary.session_start.targeting_profile_drift",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
        opecKey: canaryTargeting.opecKey,
      });
      return jsonWithRequestId(
        { error: "La selección de perfil y OPEC ya no coincide. Revisa el onboarding antes de continuar." },
        409,
        observation,
      );
    }
  }

  const onboardingCompleted = isLearningProfileOnboardingComplete(learningProfile);
  const nextItem = onboardingCompleted
    ? await selectNextItem({
        professionalProfileId: learningProfile.professional_profile_id,
        profileIdForRotation: profile.id,
        activeArea: body.area,
        activeCompetency: body.competency,
        canaryOpecId: canaryTargeting?.opecKey,
      })
    : null;

  let currentState: SessionState = "onboarding";
  if (onboardingCompleted) {
    currentState = nextItem ? "practice" : "diagnostic";
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      profile_id: profile.id,
      mode: body.mode,
      current_state: currentState,
      status: "active",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    logRequestOutcome(observation, {
      event: "canary.session_start.persist_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      opecKey: canaryTargeting?.opecKey,
      error: sessionError,
    });
    return jsonWithRequestId({ error: "Could not create session" }, 500, observation);
  }

  const response: StartSessionResponse = {
    sessionId: session.id,
    currentState,
    mode: body.mode,
    currentItemId: nextItem?.id,
    hintLevel: 0,
    activeArea: body.area,
    activeCompetency: body.competency,
    inventory: onboardingCompleted && !nextItem
      ? {
          status: "empty",
          reason: "no_active_v4_items",
          alternatives: [
            "Revisar los filtros de área y competencia",
            "Confirmar que exista inventario activo compatible con la OPEC seleccionada",
          ],
        }
      : undefined,
  };

  logRequestOutcome(observation, {
    event: "canary.session_start.completed",
    status: 200,
    sessionId: session.id,
    itemId: nextItem?.id,
    opecKey: canaryTargeting?.opecKey,
    extra: { currentState, inventoryEmpty: onboardingCompleted && !nextItem },
  });

  const httpResponse = jsonWithRequestId(response, 200, observation);
  if (canaryTargeting) {
    httpResponse.cookies.set(
      getCanarySessionTargetingCookieName(),
      buildCanarySessionTargetingCookieValue(session.id, canaryTargeting.opecKey),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      },
    );
  }
  return httpResponse;
}
