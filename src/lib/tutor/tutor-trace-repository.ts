import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TutorTurnTrace } from "../../types/tutor-turn";

export async function persistTutorTurnTrace(params: {
  profileId: string;
  trace: TutorTurnTrace;
}) {
  const { profileId, trace } = params;
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("tutor_turn_traces").insert({
    trace_id: trace.traceId,
    profile_id: profileId,
    session_id: trace.sessionId ?? null,
    question_id: trace.itemId ?? null,
    contest_id: trace.contestId ?? null,
    profile_source_id: trace.profileId ?? null,
    mode: trace.mode,
    intent: trace.intent,
    evidence_used: trace.evidenceUsed,
    source_truth_refs: trace.sourceTruthRefs,
    guardrails_applied: trace.guardrailsApplied,
    can_reveal_correct_answer: trace.canRevealCorrectAnswer,
    degraded: trace.degraded,
    confidence: trace.confidence,
    rationale_quality: trace.rationaleQuality ?? null,
    trace_signals: trace.traceSignals ?? {},
    created_at: trace.createdAt,
  });

  if (error) {
    return { ok: false as const, error };
  }

  return { ok: true as const };
}
