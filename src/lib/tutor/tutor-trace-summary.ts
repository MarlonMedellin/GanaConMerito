import { TUTOR_AUTHORITY_GUARDRAILS, TUTOR_CONTRACT_VERSION } from "../../domain/tutor/contract";

export type TutorTraceSignalStrength = "strong" | "weak" | "insufficient";

export type TutorTraceSummaryRow = {
  created_at: string;
  mode: string;
  intent: string;
  degraded: boolean;
  can_reveal_correct_answer: boolean;
  guardrails_applied: string[] | null;
  trace_signals?: {
    misconceptionDetected?: boolean;
    weakSubareaSignal?: string;
    repeatedErrorPattern?: string;
    recommendedNextPractice?: string;
    difficultyMismatch?: string;
    evidenceSummary?: string;
    recommendationEvidenceCount?: number;
    signalStrength?: TutorTraceSignalStrength;
    evidenceVsInference?: {
      evidence: string[];
      inferences: string[];
      recommendations: string[];
    };
    likelyFalsePositive?: boolean;
    hintLevelUsed?: 1 | 2 | 3;
  } | null;
};

export type TutorTraceSummary = {
  totalTurns: number;
  degradedTurns: number;
  signalLevel: "low_signal" | "emerging_signal" | "usable_signal";
  misconceptionRate: number;
  preAnswerGuardrailHits: number;
  postAnswerExplanations: number;
  misconceptionSignals: number;
  sessionsWithoutUsefulEvidence: number;
  likelyFalsePositives: number;
  recommendationCoverageRate: number;
  recommendationEvidenceSufficiencyRate: number;
  strengthDistribution: Array<{ strength: TutorTraceSignalStrength; count: number }>;
  signalFrequency: Array<{ signal: string; count: number }>;
  hintLevelDistribution: Array<{ level: 1 | 2 | 3; count: number }>;
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

function hasSignalText(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export function buildTutorTraceSummary(rows: TutorTraceSummaryRow[]): TutorTraceSummary {
  if (!rows.length) {
    return {
      totalTurns: 0,
      degradedTurns: 0,
      signalLevel: "low_signal",
      misconceptionRate: 0,
      preAnswerGuardrailHits: 0,
      postAnswerExplanations: 0,
      misconceptionSignals: 0,
      sessionsWithoutUsefulEvidence: 0,
      likelyFalsePositives: 0,
      recommendationCoverageRate: 0,
      recommendationEvidenceSufficiencyRate: 0,
      strengthDistribution: [],
      signalFrequency: [],
      hintLevelDistribution: [],
      topIntents: [],
      topGuardrails: [],
      recentTurns: [],
    };
  }

  const intentCounts = new Map<string, number>();
  const guardrailCounts = new Map<string, number>();
  const signalFrequencyCounts = new Map<string, number>();

  let degradedTurns = 0;
  let preAnswerGuardrailHits = 0;
  let postAnswerExplanations = 0;
  let misconceptionSignals = 0;
  let sessionsWithoutUsefulEvidence = 0;
  let likelyFalsePositives = 0;
  let recommendedNextPracticeSignals = 0;
  let recommendationEvidenceSufficient = 0;
  const hintLevelCounts = new Map<1 | 2 | 3, number>();
  const strengthCounts = new Map<TutorTraceSignalStrength, number>();

  for (const row of rows) {
    if (row.degraded) degradedTurns += 1;

    if (!row.can_reveal_correct_answer) {
      preAnswerGuardrailHits += 1;
    } else {
      postAnswerExplanations += 1;
    }

    if (row.trace_signals?.misconceptionDetected) {
      misconceptionSignals += 1;
      signalFrequencyCounts.set("misconceptionDetected", (signalFrequencyCounts.get("misconceptionDetected") ?? 0) + 1);
    }

    if (hasSignalText(row.trace_signals?.weakSubareaSignal)) {
      signalFrequencyCounts.set("weakSubareaSignal", (signalFrequencyCounts.get("weakSubareaSignal") ?? 0) + 1);
    }

    if (hasSignalText(row.trace_signals?.difficultyMismatch)) {
      signalFrequencyCounts.set("difficultyMismatch", (signalFrequencyCounts.get("difficultyMismatch") ?? 0) + 1);
    }

    if (hasSignalText(row.trace_signals?.repeatedErrorPattern)) {
      signalFrequencyCounts.set("repeatedErrorPattern", (signalFrequencyCounts.get("repeatedErrorPattern") ?? 0) + 1);
    }

    const hasRecommended = hasSignalText(row.trace_signals?.recommendedNextPractice);
    if (hasRecommended) {
      recommendedNextPracticeSignals += 1;
      signalFrequencyCounts.set("recommendedNextPractice", (signalFrequencyCounts.get("recommendedNextPractice") ?? 0) + 1);
      if ((row.trace_signals?.recommendationEvidenceCount ?? 0) >= 2) {
        recommendationEvidenceSufficient += 1;
      }
    }

    if ((row.trace_signals?.signalStrength ?? "insufficient") === "insufficient") {
      sessionsWithoutUsefulEvidence += 1;
    }

    if (row.trace_signals?.likelyFalsePositive) {
      likelyFalsePositives += 1;
      signalFrequencyCounts.set("likelyFalsePositive", (signalFrequencyCounts.get("likelyFalsePositive") ?? 0) + 1);
    }

    const strength = row.trace_signals?.signalStrength;
    if (strength) {
      strengthCounts.set(strength, (strengthCounts.get(strength) ?? 0) + 1);
    }

    const hintLevel = row.trace_signals?.hintLevelUsed;
    if (hintLevel) {
      hintLevelCounts.set(hintLevel, (hintLevelCounts.get(hintLevel) ?? 0) + 1);
    }

    intentCounts.set(row.intent, (intentCounts.get(row.intent) ?? 0) + 1);

    for (const guardrail of row.guardrails_applied ?? []) {
      if (!isOperationalGuardrailTag(guardrail)) continue;
      guardrailCounts.set(guardrail, (guardrailCounts.get(guardrail) ?? 0) + 1);
    }
  }

  const toTopList = <T extends string>(counts: Map<T, number>, keyName: "intent" | "guardrail" | "signal") =>
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOP_LIMIT)
      .map(([key, count]) => {
        if (keyName === "intent") return { intent: key, count };
        if (keyName === "signal") return { signal: key, count };
        return { guardrail: key, count };
      });

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
    signalLevel: rows.length >= 5 ? "usable_signal" : rows.length >= 3 ? "emerging_signal" : "low_signal",
    misconceptionRate: Number((misconceptionSignals / rows.length).toFixed(3)),
    preAnswerGuardrailHits,
    postAnswerExplanations,
    misconceptionSignals,
    sessionsWithoutUsefulEvidence,
    likelyFalsePositives,
    recommendationCoverageRate: Number((recommendedNextPracticeSignals / rows.length).toFixed(3)),
    recommendationEvidenceSufficiencyRate: recommendedNextPracticeSignals
      ? Number((recommendationEvidenceSufficient / recommendedNextPracticeSignals).toFixed(3))
      : 0,
    strengthDistribution: ["strong", "weak", "insufficient"].map((strength) => ({
      strength: strength as TutorTraceSignalStrength,
      count: strengthCounts.get(strength as TutorTraceSignalStrength) ?? 0,
    })),
    signalFrequency: toTopList(signalFrequencyCounts, "signal") as Array<{ signal: string; count: number }>,
    hintLevelDistribution: [1, 2, 3]
      .filter((level) => hintLevelCounts.has(level as 1 | 2 | 3))
      .map((level) => ({ level: level as 1 | 2 | 3, count: hintLevelCounts.get(level as 1 | 2 | 3) ?? 0 })),
    topIntents: toTopList(intentCounts, "intent") as Array<{ intent: string; count: number }>,
    topGuardrails: toTopList(guardrailCounts, "guardrail") as Array<{ guardrail: string; count: number }>,
    recentTurns,
  };
}
