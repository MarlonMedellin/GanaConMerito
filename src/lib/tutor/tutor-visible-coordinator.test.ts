import assert from "node:assert/strict";
import test from "node:test";
import type { TutorProvider, TutorShadowExecution } from "./providers/tutor-provider";
import { TutorOrchestrator } from "./tutor-orchestrator";
import { coordinateVisibleTutorTurn } from "./tutor-visible-coordinator";
import type { TutorEvidence, TutorTurnRequest } from "../../types/tutor-turn";

const evidence: TutorEvidence = {
  question: {
    itemId: "DOC-000001",
    area: "pedagogia",
    competency: "evaluacion",
    topic: "evaluacion_formativa",
    cognitiveIntent: "Aplicar",
    expectedUserTask: "Comparar opciones",
    sourceType: "official_source",
    sourceId: "source-1",
    sourceRefs: ["sourceId:source-1"],
    resolvedSources: [{ sourceId: "source-1", reference: "Fuente oficial", relationType: "decisive", knowledgeLevel: "B" }],
    stem: "Caso",
    options: [{ key: "A", text: "A" }, { key: "B", text: "B" }, { key: "C", text: "C" }, { key: "D", text: "D" }],
    correctOption: "B",
    correctExplanation: "B explica el caso.",
  },
  userSession: {
    sessionId: "session-1",
    userId: "user-1",
    selectedContestId: "contest",
    selectedProfileId: "profile",
    currentItemId: "DOC-000001",
  },
};

function input(message = "Dame una pista", extraEvidence: Partial<TutorEvidence> = {}): TutorTurnRequest {
  return {
    userId: "user-1",
    sessionId: "session-1",
    itemId: "DOC-000001",
    message,
    history: [{ role: "user", content: "Dame una pista" }, { role: "assistant", content: "Revisa la tarea esperada." }],
    evidence: { ...evidence, ...extraEvidence },
  };
}

function acceptedProvider(message = "Mensaje LLM gobernado."): TutorProvider<TutorShadowExecution> {
  return {
    name: "openrouter",
    async generate() {
      return {
        status: "accepted",
        output: {
          schemaVersion: "tutor-shadow-v1",
          visibleMessage: message,
          pedagogicalAction: "hint",
          evidenceKeys: ["question", "source_evidence", "user_session"],
          sourceIdsUsed: ["source-1"],
          sourceCitationsUsed: [{ sourceId: "source-1", reference: "Fuente oficial" }],
          sourceClaims: [{ sourceId: "source-1", claim: "used_as_evidence" }],
          uncertainty: "limited",
          requiresDeterministicFallback: false,
        },
        latencyMs: 25,
        inputTokens: 120,
        outputTokens: 40,
        costUsd: 0.001,
      };
    },
  };
}

test("visible accepted replaces only visibleMessage and keeps deterministic authority metadata", async () => {
  const turnInput = input();
  const deterministic = await new TutorOrchestrator().processTurn(turnInput);
  const coordinated = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    provider: acceptedProvider(),
    env: { GCM_TUTOR_LLM_VISIBLE: "1" },
    budget: { itemAttempts: 0, userAttemptsInWindow: 0, sessionCostUsd: 0 },
  });
  assert.equal(coordinated.result.output.visibleMessage, "Mensaje LLM gobernado.");
  assert.equal(coordinated.result.output.intent, deterministic.output.intent);
  assert.equal(coordinated.result.output.canRevealCorrectAnswer, deterministic.output.canRevealCorrectAnswer);
  assert.equal(coordinated.result.output.traceSignals?.deliveryProvider, "openrouter");
  assert.equal(coordinated.shouldRunShadow, false);
});

test("visible disabled uses deterministic and permits shadow once", async () => {
  const turnInput = input();
  const deterministic = await new TutorOrchestrator().processTurn(turnInput);
  const coordinated = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    env: { GCM_TUTOR_LLM_SHADOW: "1" },
  });
  assert.equal(coordinated.result.output.visibleMessage, deterministic.output.visibleMessage);
  assert.equal(coordinated.result.output.traceSignals?.llmMode, "shadow");
  assert.equal(coordinated.shouldRunShadow, true);
});

test("visible requested but unconfigured suppresses shadow duplication", async () => {
  const turnInput = input();
  const deterministic = await new TutorOrchestrator().processTurn(turnInput);
  const coordinated = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    env: { GCM_TUTOR_LLM_VISIBLE: "1", GCM_TUTOR_LLM_SHADOW: "1" },
  });
  assert.equal(coordinated.result.output.visibleMessage, deterministic.output.visibleMessage);
  assert.equal(coordinated.result.output.traceSignals?.llmMode, "visible");
  assert.equal(coordinated.result.output.traceSignals?.fallbackReason, "visible_disabled_or_unconfigured");
  assert.equal(coordinated.shouldRunShadow, false);
});

test("visible suppresses shadow and falls back on unsafe output", async () => {
  const turnInput = input();
  const deterministic = await new TutorOrchestrator().processTurn(turnInput);
  const coordinated = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    provider: acceptedProvider("La propuesta B representa mejor el caso."),
    env: { GCM_TUTOR_LLM_VISIBLE: "1", GCM_TUTOR_LLM_SHADOW: "1" },
    budget: { itemAttempts: 0, userAttemptsInWindow: 0, sessionCostUsd: 0 },
  });
  assert.equal(coordinated.result.output.visibleMessage, deterministic.output.visibleMessage);
  assert.equal(coordinated.result.output.traceSignals?.deliveryProvider, "deterministic");
  assert.equal(coordinated.result.output.traceSignals?.fallbackReason, "pre_answer_leak");
  assert.equal(coordinated.shouldRunShadow, false);
});

test("visible falls back for resilience and budget gates", async () => {
  const turnInput = input();
  const deterministic = await new TutorOrchestrator().processTurn(turnInput);
  const failedProvider: TutorProvider<TutorShadowExecution> = {
    name: "openrouter",
    async generate() {
      return { status: "failed", latencyMs: 10, errorCode: "network_or_timeout" };
    },
  };
  const failed = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    provider: failedProvider,
    env: { GCM_TUTOR_LLM_VISIBLE: "1" },
    budget: { itemAttempts: 0, userAttemptsInWindow: 0, sessionCostUsd: 0 },
  });
  assert.equal(failed.result.output.visibleMessage, deterministic.output.visibleMessage);
  assert.equal(failed.result.output.traceSignals?.fallbackReason, "network_or_timeout");

  const limited = await coordinateVisibleTutorTurn({
    input: turnInput,
    deterministic,
    provider: acceptedProvider(),
    env: { GCM_TUTOR_LLM_VISIBLE: "1" },
    budget: { itemAttempts: 8, userAttemptsInWindow: 0, sessionCostUsd: 0 },
  });
  assert.equal(limited.result.output.traceSignals?.fallbackReason, "item_attempt_limit");
});
