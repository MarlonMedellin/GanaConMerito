import assert from "node:assert/strict";
import test from "node:test";
import { runTutorShadow } from "./tutor-shadow-runner";
import { TutorOrchestrator } from "./tutor-orchestrator";
import type { TutorProvider, TutorShadowExecution, TutorShadowOutput } from "./providers/tutor-provider";
import type { TutorTurnRequest } from "../../types/tutor-turn";

const input: TutorTurnRequest = {
  userId: "user-1",
  sessionId: "session-1",
  itemId: "DOC-1",
  message: "Dame una pista",
  evidence: {
    question: {
      itemId: "DOC-1",
      area: "pedagogia",
      competency: "evaluacion",
      topic: "evaluacion",
      cognitiveIntent: "Aplicar",
      expectedUserTask: "Comparar opciones",
      sourceType: "official_source",
      sourceRefs: ["sourceId:source-1"],
      resolvedSources: [
        { sourceId: "source-1", reference: "Fuente oficial", relationType: "decisive", knowledgeLevel: "B" },
        { sourceId: "source-f", reference: "Fuente histórica", relationType: "supporting", knowledgeLevel: "F" },
      ],
      stem: "Caso",
      options: [{ key: "A", text: "A" }, { key: "B", text: "B" }, { key: "C", text: "C" }, { key: "D", text: "D" }],
    },
    userSession: {
      sessionId: "session-1",
      userId: "user-1",
      selectedContestId: "contest",
      selectedProfileId: "profile",
      currentItemId: "DOC-1",
    },
  },
};

function provider(output: TutorShadowOutput): TutorProvider<TutorShadowExecution> {
  return {
    name: "openrouter",
    async generate() {
      return { status: "accepted", output, latencyMs: 10, inputTokens: 100, outputTokens: 40, costUsd: 0.001 };
    },
  };
}

function output(overrides: Partial<TutorShadowOutput> = {}): TutorShadowOutput {
  return {
    schemaVersion: "tutor-shadow-v1",
    visibleMessage: "Pista segura.",
    pedagogicalAction: "hint",
    evidenceKeys: ["question", "source_evidence"],
    sourceIdsUsed: ["source-1"],
    sourceCitationsUsed: [{ sourceId: "source-1", reference: "Fuente oficial" }],
    sourceClaims: [{ sourceId: "source-1", claim: "used_as_evidence" }],
    uncertainty: "limited",
    requiresDeterministicFallback: false,
    ...overrides,
  };
}

test("shadow safety accepts safe output and rejects unsafe output without making it visible", async () => {
  const deterministic = await new TutorOrchestrator().processTurn(input);
  assert.equal((await runTutorShadow({ input, deterministic, provider: provider(output()) })).status, "accepted");
  assert.equal((await runTutorShadow({ input, deterministic, provider: provider(output({ visibleMessage: "La respuesta correcta es B." })) })).status, "rejected");
  assert.equal((await runTutorShadow({ input, deterministic, provider: provider(output({ sourceIdsUsed: ["invented"] })) })).status, "rejected");
  assert.equal((await runTutorShadow({
    input,
    deterministic,
    provider: provider(output({
      sourceIdsUsed: ["source-f"],
      sourceCitationsUsed: [{ sourceId: "source-f", reference: "Fuente histórica" }],
      sourceClaims: [{ sourceId: "source-f", claim: "presented_as_current" }],
    })),
  })).status, "rejected");
  assert.notEqual(deterministic.output.visibleMessage, "Pista segura.");
});

test("shadow is disabled when visible flag is active", async () => {
  const original = process.env.GCM_TUTOR_LLM_VISIBLE;
  process.env.GCM_TUTOR_LLM_VISIBLE = "1";
  try {
    let calls = 0;
    const deterministic = await new TutorOrchestrator().processTurn(input);
    const result = await runTutorShadow({
      input,
      deterministic,
      provider: {
        name: "openrouter",
        async generate() {
          calls += 1;
          return { status: "accepted", output: output(), latencyMs: 1 };
        },
      },
    });
    assert.equal(result.status, "disabled");
    assert.equal(calls, 0);
  } finally {
    process.env.GCM_TUTOR_LLM_VISIBLE = original;
  }
});
