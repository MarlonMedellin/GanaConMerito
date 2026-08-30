import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { TutorTurnRequest } from "../../src/types/tutor-turn";
import type { TutorProvider, TutorShadowExecution } from "../../src/lib/tutor/providers/tutor-provider";
import { validateShadowSafety } from "../../src/lib/tutor/providers/openrouter-provider";

export interface G6ShadowScenario {
  itemId: string;
  mode: "pre_answer" | "post_answer" | "adversarial";
  input: TutorTurnRequest;
}

export interface G6ShadowScenarioArtifact {
  itemId: string;
  mode: G6ShadowScenario["mode"];
  expectedSourceIds: string[];
  sourceIdsUsed: string[];
  shadowStatus: TutorShadowExecution["status"];
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number | null;
  deterministicFallbackRequired: boolean;
  contradictionDetected: boolean;
  preAnswerLeakDetected: boolean;
  inventedSourceDetected: boolean;
  sourceMismatchDetected: boolean;
  historicalMisuseDetected: boolean;
  pedagogicalUtility: "REVIEW_REQUIRED";
}

export interface G6ShadowReadinessArtifact {
  gitSha: string;
  branch: string;
  timestamp: string;
  candidateProjectRef: string;
  provider: string;
  model: string;
  scenarioCount: number;
  preAnswerScenarioCount: number;
  postAnswerScenarioCount: number;
  adversarialScenarioCount: number;
  scenarios: G6ShadowScenarioArtifact[];
  latencyP50: number;
  latencyP95: number;
  fallbackCount: number;
  fallbackRate: number;
  totalCostUsd: number;
  averageCostPerTurnUsd: number;
  artifactPath?: string;
}

function percentile(values: number[], rank: number) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil((rank / 100) * sorted.length) - 1);
  return sorted[index];
}

function expectedSourceIds(input: TutorTurnRequest) {
  return [...new Set((input.evidence.question?.resolvedSources ?? []).map((source) => source.sourceId))].sort();
}

function issueFlags(execution: TutorShadowExecution, input: TutorTurnRequest) {
  const output = execution.output;
  const safety = output ? validateShadowSafety(output, input) : { ok: false as const, reason: execution.errorCode ?? "failed" };
  return {
    preAnswerLeakDetected: safety.ok ? false : safety.reason === "pre_answer_leak",
    inventedSourceDetected: safety.ok ? false : safety.reason === "invented_source_id",
    sourceMismatchDetected: safety.ok ? false : safety.reason === "source_reference_mismatch",
    historicalMisuseDetected: safety.ok ? false : safety.reason === "historical_source_misuse",
  };
}

export async function runG6TutorShadowReadiness(params: {
  scenarios: G6ShadowScenario[];
  provider: TutorProvider<TutorShadowExecution>;
  candidateProjectRef: string;
  model: string;
  artifactRoot?: string;
  writeArtifact?: boolean;
}): Promise<G6ShadowReadinessArtifact> {
  const scenarios: G6ShadowScenarioArtifact[] = [];
  for (const scenario of params.scenarios) {
    const execution = await params.provider.generate(scenario.input);
    const flags = issueFlags(execution, scenario.input);
    scenarios.push({
      itemId: scenario.itemId,
      mode: scenario.mode,
      expectedSourceIds: expectedSourceIds(scenario.input),
      sourceIdsUsed: execution.output?.sourceIdsUsed ?? [],
      shadowStatus: execution.status,
      latencyMs: execution.latencyMs,
      inputTokens: execution.inputTokens ?? null,
      outputTokens: execution.outputTokens ?? null,
      costUsd: execution.costUsd ?? null,
      deterministicFallbackRequired: execution.output?.requiresDeterministicFallback ?? true,
      contradictionDetected: execution.output?.requiresDeterministicFallback ?? execution.status !== "accepted",
      ...flags,
      pedagogicalUtility: "REVIEW_REQUIRED",
    });
  }

  const fallbackCount = scenarios.filter((scenario) => scenario.deterministicFallbackRequired || scenario.shadowStatus !== "accepted").length;
  const totalCostUsd = scenarios.reduce((sum, scenario) => sum + (scenario.costUsd ?? 0), 0);
  const artifact: G6ShadowReadinessArtifact = {
    gitSha: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    branch: execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(),
    timestamp: new Date().toISOString(),
    candidateProjectRef: params.candidateProjectRef,
    provider: params.provider.name,
    model: params.model,
    scenarioCount: scenarios.length,
    preAnswerScenarioCount: scenarios.filter((scenario) => scenario.mode === "pre_answer").length,
    postAnswerScenarioCount: scenarios.filter((scenario) => scenario.mode === "post_answer").length,
    adversarialScenarioCount: scenarios.filter((scenario) => scenario.mode === "adversarial").length,
    scenarios,
    latencyP50: percentile(scenarios.map((scenario) => scenario.latencyMs), 50),
    latencyP95: percentile(scenarios.map((scenario) => scenario.latencyMs), 95),
    fallbackCount,
    fallbackRate: scenarios.length ? fallbackCount / scenarios.length : 0,
    totalCostUsd,
    averageCostPerTurnUsd: scenarios.length ? totalCostUsd / scenarios.length : 0,
  };

  if (params.writeArtifact ?? true) {
    const root = params.artifactRoot ?? path.join(process.cwd(), "artifacts", "g6-tutor-shadow");
    await fs.mkdir(root, { recursive: true });
    const file = path.join(root, `g6-tutor-shadow-${artifact.timestamp.replace(/[:.]/g, "-")}.json`);
    await fs.writeFile(file, JSON.stringify(artifact, null, 2) + "\n", "utf8");
    artifact.artifactPath = file;
  }
  return artifact;
}
