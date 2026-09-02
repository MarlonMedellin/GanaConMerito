import type { SupabaseClient } from "@supabase/supabase-js";
import type { TutorCandidateBudgetSnapshot } from "./tutor-candidate-policy";

export async function loadTutorBudgetSnapshot(params: {
  supabase: SupabaseClient;
  profileId: string;
  sessionId: string;
  itemId: string;
  now?: Date;
}): Promise<TutorCandidateBudgetSnapshot> {
  try {
    const allSessionItemRows = await params.supabase
      .from("tutor_turn_traces")
      .select("session_id, question_id, trace_signals, created_at")
      .eq("profile_id", params.profileId)
      .or(`session_id.eq.${params.sessionId},question_id.eq.${params.itemId}`)
      .limit(500);
    const windowRows = await params.supabase
      .from("tutor_turn_traces")
      .select("session_id, question_id, trace_signals, created_at")
      .eq("profile_id", params.profileId)
      .gte("created_at", new Date((params.now ?? new Date()).getTime() - 10 * 60 * 1000).toISOString())
      .limit(100);

    if (allSessionItemRows.error || windowRows.error || !Array.isArray(allSessionItemRows.data) || !Array.isArray(windowRows.data)) {
      return unavailable();
    }

    const itemAttempts = allSessionItemRows.data.filter((row) =>
      row.session_id === params.sessionId && row.question_id === params.itemId && isVisibleAttempt(row.trace_signals)
    ).length;
    const sessionCostUsd = allSessionItemRows.data.reduce((sum, row) => {
      if (row.session_id !== params.sessionId) return sum;
      const cost = row.trace_signals?.costUsd;
      return sum + (typeof cost === "number" ? cost : 0);
    }, 0);
    const userAttemptsInWindow = windowRows.data.filter((row) => isVisibleAttempt(row.trace_signals)).length;

    return { budgetAvailable: true, itemAttempts, userAttemptsInWindow, sessionCostUsd };
  } catch {
    return unavailable();
  }
}

function isVisibleAttempt(traceSignals: Record<string, unknown> | null | undefined) {
  return traceSignals?.llmMode === "visible" && traceSignals.llmStatus !== "skipped" && traceSignals.llmStatus !== "disabled";
}

function unavailable(): TutorCandidateBudgetSnapshot {
  return { budgetAvailable: false, itemAttempts: 0, userAttemptsInWindow: 0, sessionCostUsd: 0 };
}
