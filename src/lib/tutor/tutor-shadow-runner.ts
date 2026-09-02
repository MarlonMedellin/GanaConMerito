import type { TutorTurnRequest, TutorTurnResult } from "../../types/tutor-turn";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getOpenRouterShadowConfig, OpenRouterProvider } from "./providers/openrouter-provider";
import type { TutorProvider, TutorShadowExecution } from "./providers/tutor-provider";
import { isTutorVisibleRequested, validateShadowSafety } from "./tutor-candidate-policy";

export async function runTutorShadow(params: {
  input: TutorTurnRequest;
  deterministic: TutorTurnResult;
  provider?: TutorProvider<TutorShadowExecution>;
}) {
  if (isTutorVisibleRequested()) return { status: "disabled" as const };
  const config = getOpenRouterShadowConfig();
  const provider = params.provider ?? (config ? new OpenRouterProvider(config) : null);
  if (!provider) return { status: "disabled" as const };

  const rawExecution = await provider.generate(params.input);
  const safety = rawExecution.output
    ? validateShadowSafety(rawExecution.output, params.input)
    : { ok: true as const };
  const execution: TutorShadowExecution = safety.ok
    ? rawExecution
    : { ...rawExecution, status: "rejected", errorCode: safety.reason };
  const metric = {
    trace_id: params.deterministic.trace.traceId,
    provider: provider.name,
    model: config?.model ?? "mock",
    schema_version: "tutor-shadow-v1",
    intent: params.deterministic.output.intent,
    response_mode: params.deterministic.output.traceSignals?.responseModeUsed ?? "pre_answer",
    status: execution.status,
    latency_ms: execution.latencyMs,
    input_tokens: execution.inputTokens ?? null,
    output_tokens: execution.outputTokens ?? null,
    cost_usd: execution.costUsd ?? null,
    deterministic_fallback_required: execution.output?.requiresDeterministicFallback ?? true,
    error_code: execution.errorCode ?? null,
  };

  try {
    const { error } = await getSupabaseAdminClient().from("tutor_shadow_metrics").insert(metric);
    if (error) console.warn("[Tutor Shadow Metric Warning]", { code: error.code });
  } catch {
    console.warn("[Tutor Shadow Metric Warning]", { code: "metric_write_failed" });
  }

  return { status: execution.status };
}
