import { NextResponse } from "next/server";
import { scoreResponseBaselineHeuristicV1 } from "../../../../domain/evaluation/score-response";
import { selectNextItem } from "../../../../domain/item-selection/select-next-item";
import { getNextState } from "../../../../domain/orchestrator/session-machine";
import { defaultAttemptStore } from "../../../../domain/session/attempt-service";
import { getMaxSessionTurns } from "../../../../lib/config/session";
import { isLearningProfileOnboardingComplete } from "../../../../lib/onboarding/status";
import { V4QuestionRepository } from "../../../../lib/question-bank/v4-question-repository";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import { advanceSessionSchema } from "../../../../lib/validation/session";
import type { AdvanceSessionResponse } from "../../../../types/evaluation";
import type { SessionState } from "../../../../types/session";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
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

  const {data: prior} = await admin.from("practice_attempts").select("phase,client_request_id,request_payload,result").eq("id",body.attemptId).eq("profile_id",profile.id).maybeSingle();
  if (prior?.phase === "submitted") {
    const {data,error} = await admin.rpc("submit_practice_attempt", {p_profile_id:profile.id,p_attempt_id:body.attemptId,p_request_id:body.clientRequestId,p_payload:body,p_result:prior.result,p_next_question_id:null});
    return NextResponse.json(error ? {error:"Idempotency conflict"} : data,{status:error ? 409 : 200});
  }
  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, target_profile_code, target_opec_id, active_areas")
    .eq("profile_id", session.profile_id)
    .single();

  if (learningProfileError || !learningProfile) {
    return NextResponse.json({ error: "Learning profile not found" }, { status: 404 });
  }

  const repository = new V4QuestionRepository();
  const item = await repository.getAnsweredQuestion(body.itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data: existingTurns, error: existingTurnsError } = await supabase
    .from("session_turns")
    .select("id, question_id")
    .eq("session_id", body.sessionId)
    .order("turn_number", { ascending: true });

  if (existingTurnsError) {
    return NextResponse.json({ error: "Could not load session turns" }, { status: 500 });
  }

  const attemptRecord = await defaultAttemptStore.getAttempt(body.attemptId);
  if (!attemptRecord || attemptRecord.profileId !== profile.id || attemptRecord.sessionId !== body.sessionId || attemptRecord.itemId !== body.itemId) {
    return NextResponse.json({error:"Attempt not found"}, {status:404});
  }
  const submittedAttempt = attemptRecord;
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

  const seenItemIds = [
    ...new Set([...(existingTurns?.map((turn) => turn.question_id).filter(Boolean) ?? []), body.itemId]),
  ];

  const nextItem = currentState === "session_close"
    ? null
    : await selectNextItem({
        targetProfileCode: learningProfile.target_profile_code,
        targetOpecId: learningProfile.target_opec_id,
        profileIdForRotation: profile.id,
        sessionIdForRotation: body.sessionId,
        activeArea: item.area ?? undefined,
        activeCompetency: item.competency ?? undefined,
        excludeItemIds: seenItemIds as string[],
      });

  const attemptResult = {
    attemptId: submittedAttempt.attemptId,
    itemId: body.itemId,
    phase: "submitted" as const,
    mode: submittedAttempt.mode,
    assistanceUsed: submittedAttempt.assistanceUsed,
    selectedOption: body.selectedOption,
    correctAnswer: item.correctOption,
    isCorrect: evaluation.isCorrect,
    feedback: {
      selectedExplanation: item.explanations[body.selectedOption as "A" | "B" | "C" | "D"] ?? "",
      correctExplanation: item.explanations[item.correctOption] ?? "",
      distractorExplanations: item.explanations as Record<string, string>,
      learningNote: item.learningNote ?? "",
      sourcePresentation: item.sourceReference
        ? {
            title: item.sourceReference,
            verificationStatus: "source_verified",
          }
        : undefined,
    },
  };

  const response: AdvanceSessionResponse & { attemptResult?: typeof attemptResult } = {
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
    attemptResult,
  };



  const {data: persisted, error: persistError} = await admin.rpc("submit_practice_attempt", {
    p_profile_id: profile.id, p_attempt_id: body.attemptId, p_request_id: body.clientRequestId,
    p_payload: body, p_result: response, p_next_question_id: nextItem?.id ?? null,
  });
  if (persistError) return NextResponse.json({error:"Submission rejected", code:persistError.code}, {status:409});
  return NextResponse.json(persisted, {status:200});
}
