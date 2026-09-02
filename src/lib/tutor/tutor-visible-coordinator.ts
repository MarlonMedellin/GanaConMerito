import { hasQuestionEvidence } from "../../domain/tutor/contract";
import type { TutorTurnRequest, TutorTurnResult, TutorTraceSignals } from "../../types/tutor-turn";
import { APPROVED_OPENROUTER_MODEL, buildMinimizedShadowDossier, getOpenRouterVisibleConfig, OpenRouterProvider } from "./providers/openrouter-provider";
import type { TutorProvider, TutorShadowExecution } from "./providers/tutor-provider";
import { evaluateTutorCandidatePolicy, isTutorVisibleRequested, type TutorCandidateBudgetSnapshot } from "./tutor-candidate-policy";

export interface TutorVisibleCoordinatorResult {
  result: TutorTurnResult;
  shouldRunShadow: boolean;
}

export async function coordinateVisibleTutorTurn(params: {
  input: TutorTurnRequest;
  deterministic: TutorTurnResult;
  provider?: TutorProvider<TutorShadowExecution>;
  env?: Record<string, string | undefined>;
  budget?: TutorCandidateBudgetSnapshot;
}): Promise<TutorVisibleCoordinatorResult> {
  const config = getOpenRouterVisibleConfig(params.env);
  const visibleRequested = isTutorVisibleRequested(params.env);
  const shadowEnabled = params.env?.GCM_TUTOR_LLM_SHADOW === "1" || (!params.env && process.env.GCM_TUTOR_LLM_SHADOW === "1");

  if (!visibleRequested || (!config && !params.provider)) {
    return {
      result: withLlmTrace(params.deterministic, {
        deliveryProvider: "deterministic",
        llmMode: visibleRequested ? "visible" : shadowEnabled ? "shadow" : "off",
        llmStatus: "disabled",
        fallbackReason: "visible_disabled_or_unconfigured",
        safetyResult: "skipped",
      }),
      shouldRunShadow: shadowEnabled && !visibleRequested,
    };
  }

  const eligibilityReason = getEligibilityFallbackReason(params);
  if (eligibilityReason) {
    return {
      result: withLlmTrace(params.deterministic, {
        deliveryProvider: "deterministic",
        model: config?.model ?? APPROVED_OPENROUTER_MODEL,
        llmMode: "visible",
        llmStatus: "skipped",
        fallbackReason: eligibilityReason,
        safetyResult: "skipped",
      }),
      shouldRunShadow: false,
    };
  }

  const provider = params.provider ?? new OpenRouterProvider(config!);
  let execution: TutorShadowExecution;
  try {
    execution = await provider.generate(params.input);
  } catch {
    execution = { status: "failed", latencyMs: 0, errorCode: "provider_exception" };
  }
  const policy = evaluateTutorCandidatePolicy({
    input: params.input,
    intent: params.deterministic.output.intent,
    canRevealCorrectAnswer: params.deterministic.output.canRevealCorrectAnswer,
    execution,
    budget: params.budget,
  });

  const llmTrace = {
    deliveryProvider: policy.accepted ? "openrouter" as const : "deterministic" as const,
    model: config?.model ?? APPROVED_OPENROUTER_MODEL,
    llmMode: "visible" as const,
    llmStatus: policy.accepted ? "accepted" as const : execution.status === "accepted" ? "rejected" as const : execution.status,
    fallbackReason: policy.accepted ? undefined : policy.reason,
    latencyMs: execution.latencyMs,
    inputTokens: execution.inputTokens,
    outputTokens: execution.outputTokens,
    costUsd: execution.costUsd,
    safetyResult: policy.safetyResult,
    llmEvidenceKeys: execution.output?.evidenceKeys,
    sourceSignals: {
      sourceIdsUsed: execution.output?.sourceIdsUsed?.length ?? 0,
      sourceCitationsUsed: execution.output?.sourceCitationsUsed?.length ?? 0,
      historicalCurrentClaims: execution.output?.sourceClaims?.filter((claim) => claim.claim === "presented_as_current").length ?? 0,
    },
  };

  if (!policy.accepted || !execution.output) {
    return { result: withLlmTrace(params.deterministic, llmTrace), shouldRunShadow: false };
  }

  return {
    result: withLlmTrace({
      output: {
        ...params.deterministic.output,
        visibleMessage: execution.output.visibleMessage,
      },
      trace: params.deterministic.trace,
    }, llmTrace),
    shouldRunShadow: false,
  };
}

function getEligibilityFallbackReason(params: {
  input: TutorTurnRequest;
  deterministic: TutorTurnResult;
  budget?: TutorCandidateBudgetSnapshot;
}) {
  if (params.deterministic.output.degraded) return "deterministic_degraded";
  if (!hasQuestionEvidence(params.input.evidence)) return "missing_question_evidence";
  if (JSON.stringify(buildMinimizedShadowDossier(params.input)).length > 12_000) return "dossier_size_limit";
  if (estimateTokens(params.input) > 4_000) return "input_token_limit";
  if (!params.budget?.budgetAvailable) return "budget_unavailable";
  if ((params.budget?.itemAttempts ?? 0) >= 8) return "item_attempt_limit";
  if ((params.budget?.userAttemptsInWindow ?? 0) >= 20) return "user_rate_limit";
  if ((params.budget?.sessionCostUsd ?? 0) >= 0.20) return "session_budget_exceeded";
  return null;
}

function estimateTokens(input: TutorTurnRequest) {
  return Math.ceil(JSON.stringify({ message: input.message, history: input.history, evidence: input.evidence }).length / 4);
}

function withLlmTrace(result: TutorTurnResult, signals: Partial<TutorTraceSignals>): TutorTurnResult {
  const traceSignals = {
    ...result.output.traceSignals,
    ...signals,
    traceId: result.trace.traceId,
  } as TutorTraceSignals;
  return {
    output: { ...result.output, traceSignals },
    trace: { ...result.trace, traceSignals },
  };
}
