import type { TutorEvidence, TutorIntent, TutorTurnRequest } from "../../types/tutor-turn";
import type { TutorShadowExecution, TutorShadowOutput } from "./providers/tutor-provider";

export interface TutorCandidateBudgetSnapshot {
  budgetAvailable: boolean;
  itemAttempts: number;
  userAttemptsInWindow: number;
  sessionCostUsd: number;
}

export interface TutorCandidatePolicyDecision {
  accepted: boolean;
  reason: string;
  safetyResult: "accepted" | "rejected" | "skipped";
}

const VALID_EVIDENCE_KEYS = new Set(["question", "source_evidence", "user_session", "contest", "aspirational_profile", "recent_performance"]);
const MAX_TURN_COST_USD = 0.01;
const MAX_SESSION_COST_USD = 0.20;
const MAX_OUTPUT_TOKENS = 400;
const MAX_INPUT_TOKENS = 4_000;

export function evaluateTutorCandidatePolicy(params: {
  input: TutorTurnRequest;
  intent: TutorIntent;
  canRevealCorrectAnswer: boolean;
  execution: TutorShadowExecution;
  budget?: TutorCandidateBudgetSnapshot;
}): TutorCandidatePolicyDecision {
  const { execution } = params;
  if (execution.status !== "accepted" || !execution.output) {
    return reject(execution.errorCode ?? execution.status, "skipped");
  }
  if (!params.budget?.budgetAvailable) return reject("budget_unavailable", "skipped");
  if (execution.output.requiresDeterministicFallback) return reject("requires_deterministic_fallback");
  if (execution.output.uncertainty === "insufficient") return reject("uncertainty_insufficient");
  if (execution.inputTokens === undefined || execution.outputTokens === undefined || execution.costUsd === undefined) return reject("usage_missing");
  if (execution.inputTokens > MAX_INPUT_TOKENS) return reject("input_token_limit");
  if (execution.outputTokens > MAX_OUTPUT_TOKENS) return reject("output_token_limit");
  if (execution.costUsd > MAX_TURN_COST_USD) return reject("turn_budget_exceeded");
  if ((params.budget.sessionCostUsd + execution.costUsd) > MAX_SESSION_COST_USD) return reject("session_budget_exceeded");

  const safety = validateTutorCandidateSafety({
    output: execution.output,
    input: params.input,
    intent: params.intent,
    canRevealCorrectAnswer: params.canRevealCorrectAnswer,
  });
  if (!safety.ok) return reject(safety.reason);
  return { accepted: true, reason: "accepted", safetyResult: "accepted" };
}

export function validateTutorCandidateSafety(params: {
  output: TutorShadowOutput;
  input: TutorTurnRequest;
  intent: TutorIntent;
  canRevealCorrectAnswer: boolean;
}) {
  const { output, input } = params;
  if (output.evidenceKeys.some((key) => !VALID_EVIDENCE_KEYS.has(key))) return { ok: false as const, reason: "unknown_evidence_key" };
  if (output.evidenceKeys.some((key) => !isEvidenceKeyAvailable(key, input.evidence))) return { ok: false as const, reason: "unavailable_evidence_key" };
  const sourcesById = new Map((input.evidence.question?.resolvedSources ?? []).map((source) => [source.sourceId, source]));

  for (const sourceId of output.sourceIdsUsed ?? []) {
    if (!sourcesById.has(sourceId)) return { ok: false as const, reason: "invented_source_id" };
  }
  for (const citation of output.sourceCitationsUsed ?? []) {
    const source = sourcesById.get(citation.sourceId);
    if (!source) return { ok: false as const, reason: "invented_source_id" };
    if (source.reference !== citation.reference) return { ok: false as const, reason: "source_reference_mismatch" };
  }
  for (const claim of output.sourceClaims ?? []) {
    const source = sourcesById.get(claim.sourceId);
    if (!source) return { ok: false as const, reason: "invented_source_id" };
    if (claim.claim === "presented_as_current" && source.knowledgeLevel === "F") return { ok: false as const, reason: "historical_source_misuse" };
  }
  if (!params.canRevealCorrectAnswer && hasPreAnswerOptionLeak(output.visibleMessage)) return { ok: false as const, reason: "pre_answer_leak" };
  if (!params.canRevealCorrectAnswer && recommendsExactOptionText(output.visibleMessage, input.evidence)) return { ok: false as const, reason: "pre_answer_option_text_leak" };
  if (hasAuthorityClaim(output.visibleMessage)) return { ok: false as const, reason: "authority_mutation_claim" };
  if (hasInternalLeak(output.visibleMessage)) return { ok: false as const, reason: "internal_or_secret_leak" };
  if (!isActionCompatible(output.pedagogicalAction, params.intent, params.canRevealCorrectAnswer)) {
    return { ok: false as const, reason: "incompatible_pedagogical_action" };
  }
  return { ok: true as const };
}

export function validateShadowSafety(output: TutorShadowOutput, input: TutorTurnRequest) {
  return validateTutorCandidateSafety({
    output,
    input,
    intent: "clarify_concept",
    canRevealCorrectAnswer: Boolean(input.evidence.userSession.selectedOption),
  });
}

function isEvidenceKeyAvailable(key: string, evidence: TutorEvidence) {
  if (key === "question") return Boolean(evidence.question);
  if (key === "source_evidence") return Boolean(evidence.question?.resolvedSources?.some((source) => source.sourceId && source.reference));
  if (key === "user_session") return Boolean(evidence.userSession);
  if (key === "contest") return Boolean(evidence.contest);
  if (key === "aspirational_profile") return Boolean(evidence.aspirationalProfile);
  if (key === "recent_performance") return Boolean(evidence.userSession.recentPerformanceSummary);
  return false;
}

function hasPreAnswerOptionLeak(message: string) {
  const optionReference = String.raw`(?:opci[oó]n|alternativa|propuesta)\s+([A-D])`;
  const directCorrect = new RegExp(String.raw`(?:clave|opci[oó]n correcta|respuesta correcta)\s*(?:es|:)\s*[A-D]`, "i");
  const optionIsRanked = new RegExp(String.raw`${optionReference}\s+(?:es|ser[ií]a|resulta)\s+(?:la\s+)?(?:m[aá]s\s+)?(?:correcta|adecuada|pertinente|conveniente|apropiada|preferible|recomendable|mejor)`, "i");
  const optionRepresentsBest = new RegExp(String.raw`${optionReference}\s+(?:representa|responde|refleja|encarna)\s+mejor\b`, "i");
  const bestIsOption = new RegExp(String.raw`(?:la\s+)?(?:m[aá]s\s+)?(?:correcta|adecuada|pertinente|conveniente|apropiada|preferible|recomendable|mejor)\s+(?:es|ser[ií]a|resulta)\s+(?:la\s+)?${optionReference}`, "i");
  return directCorrect.test(message) || optionIsRanked.test(message) || optionRepresentsBest.test(message) || bestIsOption.test(message);
}

export function isTutorVisibleRequested(env: Record<string, string | undefined> = process.env) {
  return env.GCM_TUTOR_LLM_VISIBLE === "1";
}

function recommendsExactOptionText(message: string, evidence: TutorEvidence) {
  const normalizedMessage = normalize(message);
  return (evidence.question?.options ?? []).some((option) => {
    const text = normalize(option.text);
    return text.length >= 12 && normalizedMessage.includes(text) && /(?:elige|selecciona|marca|escoge|recomiendo|conviene|mejor)/i.test(message);
  });
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function hasAuthorityClaim(message: string) {
  return /(?:puntaje|score|avance|sesión|sesion|cerré|cerre|registré|registre|guardé|guarde|aprobado oficial|resultado oficial)/i.test(message);
}

function hasInternalLeak(message: string) {
  return /(?:OPENROUTER_API_KEY|SUPABASE_SERVICE_ROLE|system prompt|instrucciones internas|\/home\/|\/mnt\/|\/opt\/|sk-[A-Za-z0-9])/i.test(message);
}

function isActionCompatible(action: TutorShadowOutput["pedagogicalAction"], intent: TutorIntent, canRevealCorrectAnswer: boolean) {
  if (!canRevealCorrectAnswer && action === "feedback") return false;
  if (intent === "give_hint") return action === "hint" || action === "explain";
  if (intent === "compare_options") return action === "compare" || action === "explain";
  if (intent === "explain_feedback") return canRevealCorrectAnswer ? action === "feedback" || action === "explain" : action !== "feedback";
  if (intent === "recommend_next_practice") return action === "recommend" || action === "explain";
  return action !== "degrade";
}

function reject(reason: string, safetyResult: TutorCandidatePolicyDecision["safetyResult"] = "rejected"): TutorCandidatePolicyDecision {
  return { accepted: false, reason, safetyResult };
}
