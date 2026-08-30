import assert from "node:assert/strict";
import test from "node:test";
import type { TutorProvider, TutorShadowExecution } from "../src/lib/tutor/providers/tutor-provider";
import type { TutorTurnRequest } from "../src/types/tutor-turn";
import { runG6TutorShadowReadiness, type G6ShadowScenario } from "./lib/g6-tutor-shadow-readiness";

function input(): TutorTurnRequest {
  return {
    userId: "qa-user",
    sessionId: "qa-session",
    itemId: "DOC-000001",
    message: "Dame una pista.",
    evidence: {
      question: {
        itemId: "DOC-000001",
        area: "evaluacion",
        competency: "decision_pedagogica",
        topic: "evaluacion_formativa",
        cognitiveIntent: "Aplicar una regla de evaluación.",
        expectedUserTask: "Elegir la acción pedagógica consistente.",
        sourceType: "official_source",
        sourceId: "col-decreto-1290-evaluacion-estudiantes",
        sourceRefs: ["sourceId:col-decreto-1290-evaluacion-estudiantes"],
        resolvedSources: [
          {
            sourceId: "col-decreto-1290-evaluacion-estudiantes",
            reference: "Decreto 1290 de 2009",
            relationType: "decisive",
            sourceTruthStatus: "source_verified",
            knowledgeLevel: "B",
          },
        ],
        stem: "¿Qué acción procede?",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
          { key: "C", text: "C" },
          { key: "D", text: "D" },
        ],
      },
      userSession: {
        sessionId: "qa-session",
        userId: "qa-user",
        selectedContestId: "contest",
        selectedProfileId: "profile",
        currentItemId: "DOC-000001",
      },
    },
  };
}

class MockProvider implements TutorProvider<TutorShadowExecution> {
  readonly name = "mock";

  async generate(request: TutorTurnRequest): Promise<TutorShadowExecution> {
    return {
      status: "accepted",
      latencyMs: request.itemId === "DOC-000001" ? 10 : 20,
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.001,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Pista simulada.",
        pedagogicalAction: "hint",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }],
        sourceClaims: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", claim: "used_as_evidence" }],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    };
  }
}

test("G6 shadow readiness runner aggregates scenario metrics without live provider", async () => {
  const scenarios: G6ShadowScenario[] = [
    { itemId: "DOC-000001", mode: "pre_answer", input: input() },
    { itemId: "DOC-000002", mode: "post_answer", input: { ...input(), itemId: "DOC-000002" } },
  ];
  const artifact = await runG6TutorShadowReadiness({
    scenarios,
    provider: new MockProvider(),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });

  assert.equal(artifact.candidateProjectRef, "dhiytzbwodfvdrnwhkcw");
  assert.equal(artifact.scenarioCount, 2);
  assert.equal(artifact.preAnswerScenarioCount, 1);
  assert.equal(artifact.postAnswerScenarioCount, 1);
  assert.equal(artifact.fallbackCount, 0);
  assert.equal(artifact.fallbackRate, 0);
  assert.equal(artifact.totalCostUsd, 0.002);
  assert.equal(artifact.averageCostPerTurnUsd, 0.001);
  assert.equal(artifact.latencyP50, 10);
  assert.equal(artifact.latencyP95, 20);
  assert.deepEqual(artifact.scenarios[0].expectedSourceIds, ["col-decreto-1290-evaluacion-estudiantes"]);
  assert.deepEqual(artifact.scenarios[0].sourceIdsUsed, ["col-decreto-1290-evaluacion-estudiantes"]);
  assert.equal(artifact.scenarios[0].pedagogicalUtility, "REVIEW_REQUIRED");
});
