import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { scoreResponseBaselineHeuristicV1 } from "../../../../domain/evaluation/score-response";
import { selectNextItem } from "../../../../domain/item-selection/select-next-item";
import { getNextState } from "../../../../domain/orchestrator/session-machine";
import { getMaxSessionTurns } from "../../../../lib/config/session";
import { isLearningProfileOnboardingComplete } from "../../../../lib/onboarding/status";
import { V4QuestionRepository } from "../../../../lib/question-bank/v4-question-repository";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import {
  getCanarySessionTargetingContext,
  getCanarySessionTargetingCookieName,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";
import { advanceSessionSchema } from "../../../../lib/validation/session";
import type { AdvanceSessionResponse } from "../../../../types/evaluation";
import type { SessionState } from "../../../../types/session";

export async function POST(request: Request) {
  const observation = beginRequestObservation(request, "/api/session/advance");
  let json: unknown;
  try {
    json = await request.json();
  } catch (error) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.invalid_json",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_JSON,
      error,
    });
    return jsonWithRequestId({ error: "Invalid session advance payload" }, 400, observation);
  }

  const parsedBody = advanceSessionSchema.safeParse(json);
  if (!parsedBody.success) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.invalid_body",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
    });
    return jsonWithRequestId(
      { error: parsedBody.error.issues.map((issue) => issue.message).join(" | ") },
      400,
      observation,
    );
  }

  const body = parsedBody.data;
  const auth = await requireOwnedSession({ sessionId: body.sessionId });
  if (!auth.ok) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.auth_or_ownership_failed",
      status: auth.status,
      errorCode: auth.status === 401 ? API_ERROR_CODES.AUTH_UNAUTHORIZED : API_ERROR_CODES.SESSION_NOT_FOUND,
      sessionId: body.sessionId,
      itemId: body.itemId,
    });
    return jsonWithRequestId({ error: auth.error }, auth.status, observation);
  }

  const { supabase, profile, session } = auth;
  const admin = getSupabaseAdminClient();

  if (session.status !== "active" || ["session_close", "expired", "error"].includes(session.current_state)) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.terminal_session",
      status: 409,
      errorCode: API_ERROR_CODES.SESSION_TERMINAL,
      sessionId: body.sessionId,
      itemId: body.itemId,
    });
    return jsonWithRequestId({ error: "Session is no longer active" }, 409, observation);
  }

  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, professional_profile_id, active_areas")
    .eq("profile_id", session.profile_id)
    .single();

  if (learningProfileError || !learningProfile) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.learning_profile_missing",
      status: 404,
      errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
      sessionId: body.sessionId,
      itemId: body.itemId,
      error: learningProfileError,
    });
    return jsonWithRequestId({ error: "Learning profile not found" }, 404, observation);
  }

  let canaryTargeting = null;
  if (isCanaryTargetingEnabled()) {
    let sessionTargeting;
    try {
      sessionTargeting = await getCanarySessionTargetingContext();
    } catch (error) {
      logRequestOutcome(observation, {
        event: "canary.session_advance.catalog_invalid",
        status: 500,
        errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
        sessionId: body.sessionId,
        itemId: body.itemId,
        error,
      });
      return jsonWithRequestId({ error: "Canary targeting catalog is not valid." }, 500, observation);
    }

    if (!sessionTargeting || sessionTargeting.sessionId !== body.sessionId) {
      logRequestOutcome(observation, {
        event: "canary.session_advance.session_targeting_missing",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
        sessionId: body.sessionId,
        itemId: body.itemId,
      });
      return jsonWithRequestId(
        { error: "La sesión perdió su contexto de OPEC. Inicia una nueva práctica canary." },
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
        event: "canary.session_advance.targeting_profile_drift",
        status: 409,
        errorCode: API_ERROR_CODES.SESSION_INVALID_STATE,
        sessionId: body.sessionId,
        itemId: body.itemId,
        opecKey: canaryTargeting.opecKey,
      });
      return jsonWithRequestId(
        { error: "La selección de perfil y OPEC ya no coincide. Revisa el onboarding antes de continuar." },
        409,
        observation,
      );
    }
  }

  const repository = new V4QuestionRepository();
  const item = await repository.getAnsweredQuestion(body.itemId);
  if (!item) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.item_missing",
      status: 404,
      errorCode: API_ERROR_CODES.CONTENT_INVALID,
      sessionId: body.sessionId,
      itemId: body.itemId,
      opecKey: canaryTargeting?.opecKey,
    });
    return jsonWithRequestId({ error: "Item not found" }, 404, observation);
  }

  const { data: existingTurns, error: existingTurnsError } = await supabase
    .from("session_turns")
    .select("id, item_id")
    .eq("session_id", body.sessionId)
    .order("turn_number", { ascending: true });

  if (existingTurnsError) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.turns_load_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      sessionId: body.sessionId,
      itemId: body.itemId,
      error: existingTurnsError,
    });
    return jsonWithRequestId({ error: "Could not load session turns" }, 500, observation);
  }

  const evaluation = scoreResponseBaselineHeuristicV1({
    selectedOption: body.selectedOption,
    correctOption: item.correctOption,
    difficulty: item.difficulty,
    userRationale: body.userRationale,
  });

  const feedbackText =
    evaluation.qualitativeFeedback ??
    (evaluation.isCorrect
      ? "Respuesta correcta. Continuemos."
      : "Necesitas refuerzo en este punto. Revisemos la premisa clave.");

  const previousState = session.current_state as SessionState;
  const onboardingCompleted = isLearningProfileOnboardingComplete(learningProfile);
  const shouldReview = existingTurns.length > 0 && !evaluation.remediationNeeded;
  const maxSessionTurns = getMaxSessionTurns();
  const isSessionEnding = existingTurns.length + 1 >= maxSessionTurns;
  const currentState = getNextState({
    currentState: previousState,
    onboardingCompleted,
    hasBaseline: existingTurns.length > 0 || previousState !== "diagnostic",
    remediationNeeded: evaluation.remediationNeeded,
    shouldReview,
    isSessionEnding,
    isExpired: false,
    hasError: false,
  });

  const { error: advanceError } = await admin.rpc("advance_session_atomic", {
    p_profile_id: profile.id,
    p_session_id: body.sessionId,
    p_item_id: body.itemId,
    p_selected_option: body.selectedOption ?? null,
    p_user_rationale: body.userRationale ?? null,
    p_response_time_ms: body.responseTimeMs ?? null,
    p_confidence_self_report: body.confidenceSelfReport ?? null,
    p_feedback_text: feedbackText,
    p_is_correct: evaluation.isCorrect,
    p_reasoning_score: evaluation.reasoningScore,
    p_normative_consistency_score: evaluation.normativeConsistencyScore,
    p_competency_score: evaluation.competencyScore,
    p_estimated_theta_delta: evaluation.estimatedThetaDelta,
    p_remediation_needed: evaluation.remediationNeeded,
    p_evaluation_source: evaluation.evaluationSource,
    p_evaluation_version: evaluation.evaluationVersion,
    p_previous_state: previousState,
    p_current_state: currentState,
  });

  if (advanceError) {
    logRequestOutcome(observation, {
      event: "canary.session_advance.atomic_persist_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      sessionId: body.sessionId,
      itemId: body.itemId,
      opecKey: canaryTargeting?.opecKey,
      extra: {
        previousState,
        currentState,
        evaluationSource: evaluation.evaluationSource,
        evaluationVersion: evaluation.evaluationVersion,
      },
      error: advanceError,
    });
    return jsonWithRequestId({ error: "Could not persist session advance atomically" }, 500, observation);
  }

  const seenItemIds = [
    ...new Set([...(existingTurns?.map((turn) => turn.item_id).filter(Boolean) ?? []), body.itemId]),
  ];

  const nextItem = currentState === "session_close"
    ? null
    : await selectNextItem({
        professionalProfileId: learningProfile.professional_profile_id,
        profileIdForRotation: profile.id,
        sessionIdForRotation: body.sessionId,
        activeArea: item.area ?? undefined,
        activeCompetency: item.competency ?? undefined,
        canaryOpecId: canaryTargeting?.opecKey,
        excludeItemIds: seenItemIds as string[],
      });

  const response: AdvanceSessionResponse = {
    sessionId: body.sessionId,
    previousState,
    currentState,
    evaluation,
    answerReview: {
      selectedOption: body.selectedOption,
      correctOption: item.correctOption,
      selectedExplanation: item.explanations[body.selectedOption],
      correctExplanation: item.explanations[item.correctOption],
      learningNote: item.learningNote,
      sourceReference: item.sourceReference,
    },
    feedbackText,
    hintLevel: evaluation.remediationNeeded ? 1 : 0,
    nextItemId: nextItem?.id,
    shouldTransition: previousState !== currentState,
  };

  logRequestOutcome(observation, {
    event: "canary.session_advance.completed",
    status: 200,
    sessionId: body.sessionId,
    itemId: body.itemId,
    opecKey: canaryTargeting?.opecKey,
    extra: {
      currentState,
      nextItemAvailable: Boolean(nextItem),
      isCorrect: evaluation.isCorrect,
    },
  });

  const httpResponse = jsonWithRequestId(response, 200, observation);
  if (currentState === "session_close" && isCanaryTargetingEnabled()) {
    httpResponse.cookies.delete(getCanarySessionTargetingCookieName());
  }
  return httpResponse;
}
