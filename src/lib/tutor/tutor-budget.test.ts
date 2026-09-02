import assert from "node:assert/strict";
import test from "node:test";
import { loadTutorBudgetSnapshot } from "./tutor-budget";

function supabaseMock(results: Array<{ data: any[] | null; error?: unknown }>) {
  const calls: string[] = [];
  return {
    from(table: string) {
      calls.push(`from:${table}`);
      const result = results.shift() ?? { data: null, error: new Error("missing result") };
      const chain: any = {
        select() { return chain; },
        eq() { return chain; },
        or() { return chain; },
        gte() { return chain; },
        limit() { return Promise.resolve(result); },
      };
      return chain;
    },
    calls,
  };
}

test("budget snapshot separates item, session and user window limits", async () => {
  const visibleTrace = { llmMode: "visible", llmStatus: "accepted", costUsd: 0.03 };
  const mock = supabaseMock([
    { data: [
      { session_id: "session-1", question_id: "DOC-1", trace_signals: visibleTrace, created_at: "2026-09-01T00:00:00.000Z" },
      { session_id: "session-1", question_id: "DOC-2", trace_signals: visibleTrace, created_at: "2026-08-01T00:00:00.000Z" },
      { session_id: "session-2", question_id: "DOC-1", trace_signals: visibleTrace, created_at: "2026-08-01T00:00:00.000Z" },
      { session_id: "session-1", question_id: "DOC-1", trace_signals: { llmMode: "visible", llmStatus: "skipped", costUsd: 0.05 }, created_at: "2026-08-01T00:00:00.000Z" },
    ] },
    { data: [
      { session_id: "session-9", question_id: "DOC-9", trace_signals: visibleTrace, created_at: "2026-09-01T00:09:00.000Z" },
      { session_id: "session-9", question_id: "DOC-8", trace_signals: { llmMode: "shadow", llmStatus: "accepted" }, created_at: "2026-09-01T00:09:00.000Z" },
    ] },
  ]);

  const budget = await loadTutorBudgetSnapshot({
    supabase: mock as any,
    profileId: "user-1",
    sessionId: "session-1",
    itemId: "DOC-1",
    now: new Date("2026-09-01T00:10:00.000Z"),
  });
  assert.deepEqual(budget, {
    budgetAvailable: true,
    itemAttempts: 1,
    userAttemptsInWindow: 1,
    sessionCostUsd: 0.11,
  });
});

test("budget snapshot is unavailable when any query fails or is incomplete", async () => {
  const failed = await loadTutorBudgetSnapshot({
    supabase: supabaseMock([{ data: null, error: new Error("db") }, { data: [] }]) as any,
    profileId: "user-1",
    sessionId: "session-1",
    itemId: "DOC-1",
  });
  assert.equal(failed.budgetAvailable, false);

  const incomplete = await loadTutorBudgetSnapshot({
    supabase: supabaseMock([{ data: [] }, { data: null }]) as any,
    profileId: "user-1",
    sessionId: "session-1",
    itemId: "DOC-1",
  });
  assert.equal(incomplete.budgetAvailable, false);
});
