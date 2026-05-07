import { TUTOR_AUTHORITY_GUARDRAILS, TUTOR_CONTRACT_VERSION } from "../../domain/tutor/contract";

export type TutorTraceSummaryRow = {
  created_at: string;
  mode: string;
  intent: string;
  degraded: boolean;
  can_reveal_correct_answer: boolean;
  guardrails_applied: string[] | null;
};

export type TutorTraceSummary = {
  totalTurns: number;
  degradedTurns: number;
  preAnswerGuardrailHits: number;
  postAnswerExplanations: number;
  topIntents: Array<{ intent: string; count: number }>;
  topGuardrails: Array<{ guardrail: string; count: number }>;
  recentTurns: Array<{
    createdAt: string;
    mode: string;
    intent: string;
    degraded: boolean;
    canRevealCorrectAnswer: boolean;
  }>;
};

const TOP_LIMIT = 5;
const KNOWN_OPERATIONAL_GUARDRAILS = new Set([
  ...TUTOR_AUTHORITY_GUARDRAILS,
  "no_correct_answer_before_user_answer",
  "degrade_on_missing_evidence",
  "validate_tutor_turn_request",
]);

function isOperationalGuardrailTag(tag: string) {
  return tag !== TUTOR_CONTRACT_VERSION && KNOWN_OPERATIONAL_GUARDRAILS.has(tag);
}

export function buildTutorTraceSummary(rows: TutorTraceSummaryRow[]): TutorTraceSummary {
  if (!rows.length) {
    return {
      totalTurns: 0,
      degradedTurns: 0,
      preAnswerGuardrailHits: 0,
      postAnswerExplanations: 0,
      topIntents: [],
      topGuardrails: [],
      recentTurns: [],
    };
  }

  const intentCounts = new Map<string, number>();
  const guardrailCounts = new Map<string, number>();

  let degradedTurns = 0;
  let preAnswerGuardrailHits = 0;
  let postAnswerExplanations = 0;

  for (const row of rows) {
    if (row.degraded) degradedTurns += 1;

    if (!row.can_reveal_correct_answer) {
      preAnswerGuardrailHits += 1;
    } else {
      postAnswerExplanations += 1;
    }

    intentCounts.set(row.intent, (intentCounts.get(row.intent) ?? 0) + 1);

    for (const guardrail of row.guardrails_applied ?? []) {
      if (!isOperationalGuardrailTag(guardrail)) continue;
      guardrailCounts.set(guardrail, (guardrailCounts.get(guardrail) ?? 0) + 1);
    }
  }

  const toTopList = <T extends string>(counts: Map<T, number>, keyName: "intent" | "guardrail") =>
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOP_LIMIT)
      .map(([key, count]) => (keyName === "intent" ? { intent: key, count } : { guardrail: key, count }));

  const recentTurns = [...rows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, TOP_LIMIT)
    .map((row) => ({
      createdAt: row.created_at,
      mode: row.mode,
      intent: row.intent,
      degraded: row.degraded,
      canRevealCorrectAnswer: row.can_reveal_correct_answer,
    }));

  return {
    totalTurns: rows.length,
    degradedTurns,
    preAnswerGuardrailHits,
    postAnswerExplanations,
    topIntents: toTopList(intentCounts, "intent") as Array<{ intent: string; count: number }>,
    topGuardrails: toTopList(guardrailCounts, "guardrail") as Array<{ guardrail: string; count: number }>,
    recentTurns,
  };
}
