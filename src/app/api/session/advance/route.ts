import { NextResponse } from "next/server";
import { scoreResponseBaselineHeuristicV1 } from "../../../../domain/evaluation/score-response";
import { selectNextItem } from "../../../../domain/item-selection/select-next-item";
import { getNextState } from "../../../../domain/orchestrator/session-machine";
import { getMaxSessionTurns } from "../../../../lib/config/session";
import { isLearningProfileOnboardingComplete } from "../../../../lib/onboarding/status";
import { applyActiveItemBankFilters, runWithActiveItemBankFallback } from "../../../../lib/supabase/active-item-bank";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import { advanceSessionSchema } from "../../../../lib/validation/session";
import type { AdvanceSessionResponse } from "../../../../types/evaluation";
import type { SessionState } from "../../../../types/session";

interface SessionAdvanceItemRecord {
  id: string;
  correct_option: string;
  difficulty: number | string | null;
  area: string | null;
  competency: string | null;
  explanation: string | null;
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsedBody = advanceSessionSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues.map((issue) => issue.message).join(" | ") },
      { status: 400 },
    );
  }

  const body = parsedBody.data;
  const auth = await requireOwnedSession({ sessionId: body.sessionId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, profile, session } = auth;
  const admin = getSupabaseAdminClient();

  if (session.status !== "active") {
    return NextResponse.json({ error: "Session is no longer active" }, { status: 409 });
  }

  if (["session_close", "expired", "error"].includes(session.current_state)) {
    return NextResponse.json({ error: "Session is already closed" }, { status: 409 });
  }

  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, professional_profile_id, active_areas")
    .eq("profile_id", session.profile_id)
    .single();

  if (learningProfileError || !learningProfile) {
    return NextResponse.json({ error: "Learning profile not found" }, { status: 404 });
  }

  const { data: item, error: itemError } = await runWithActiveItemBankFallback<SessionAdvanceItemRecord>((source) =>
    applyActiveItemBankFilters(
      admin.from(source).select("id, correct_option, difficulty, area, competency, explanation").eq("id", body.itemId),
      source,
    ).single(),
  );

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data: existingTurns, error: existingTurnsError } = await supabase
    .from("session_turns")
    .select("id, item_id")
    .eq("session_id", body.sessionId)
    .order("turn_number", { ascending: true });

  if (existingTurnsError) {
    return NextResponse.json({ error: "Could not load session turns" }, { status: 500 });
  }

  const evaluation = scoreResponseBaselineHeuristicV1({
    selectedOption: body.selectedOption,
    correctOption: item.correct_option,
    difficulty: Number(item.difficulty),
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
    console.error("advance_session_atomic failed", {
      message: advanceError.message,
      details: advanceError.details,
      hint: advanceError.hint,
      code: advanceError.code,
      sessionId: body.sessionId,
      itemId: body.itemId,
      profileId: profile.id,
      previousState,
      currentState,
      evaluationSource: evaluation.evaluationSource,
      evaluationVersion: evaluation.evaluationVersion,
    });

    return NextResponse.json({ error: "Could not persist session advance atomically" }, { status: 500 });
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
        excludeItemIds: seenItemIds as string[],
      });

  const response: AdvanceSessionResponse = {
    sessionId: body.sessionId,
    previousState,
    currentState,
    evaluation,
    answerReview: {
      selectedOption: body.selectedOption,
      correctOption: item.correct_option as "A" | "B" | "C" | "D",
      explanation: item.explanation ?? undefined,
    },
    feedbackText,
    hintLevel: evaluation.remediationNeeded ? 1 : 0,
    nextItemId: nextItem?.id,
    shouldTransition: previousState !== currentState,
  };

  return NextResponse.json(response, { status: 200 });
}
