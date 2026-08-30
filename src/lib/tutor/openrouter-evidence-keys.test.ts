import assert from "node:assert/strict";
import test from "node:test";
import type { TutorTurnRequest } from "../../types/tutor-turn";
import {
  OpenRouterProvider,
  TUTOR_SHADOW_EVIDENCE_KEYS,
  TUTOR_SHADOW_JSON_SCHEMA,
  resetOpenRouterCircuitForTests,
} from "./providers/openrouter-provider";

const input: TutorTurnRequest = {
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
      cognitiveIntent: "Aplicar una regla.",
      expectedUserTask: "Comparar opciones.",
      sourceType: "official_source",
      sourceId: "col-decreto-1290-evaluacion-estudiantes",
      sourceRefs: ["sourceId:col-decreto-1290-evaluacion-estudiantes"],
      resolvedSources: [{
        sourceId: "col-decreto-1290-evaluacion-estudiantes",
        reference: "Decreto 1290 de 2009",
        relationType: "decisive",
        sourceTruthStatus: "source_verified",
        knowledgeLevel: "B",
      }],
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

test("OpenRouter evidenceKeys schema is restricted to the governed vocabulary", () => {
  assert.deepEqual(
    TUTOR_SHADOW_JSON_SCHEMA.properties.evidenceKeys.items.enum,
    TUTOR_SHADOW_EVIDENCE_KEYS,
  );
});

test("OpenRouter rejects an unknown evidence key at schema parsing", async () => {
  resetOpenRouterCircuitForTests();
  const fetchMock = async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({
      schemaVersion: "tutor-shadow-v1",
      visibleMessage: "Pista segura.",
      pedagogicalAction: "hint",
      evidenceKeys: ["question", "source_evidence", "knowledge_base"],
      sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
      sourceCitationsUsed: [{
        sourceId: "col-decreto-1290-evaluacion-estudiantes",
        reference: "Decreto 1290 de 2009",
      }],
      sourceClaims: [{
        sourceId: "col-decreto-1290-evaluacion-estudiantes",
        claim: "used_as_evidence",
      }],
      uncertainty: "limited",
      requiresDeterministicFallback: false,
    }) } }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  const provider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    fetchMock as typeof fetch,
  );
  const result = await provider.generate(input);
  assert.equal(result.status, "rejected");
  assert.equal(result.errorCode, "invalid_or_unsafe_output");
});
