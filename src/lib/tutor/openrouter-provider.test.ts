import assert from "node:assert/strict";
import test from "node:test";
import type { TutorTurnRequest } from "../../types/tutor-turn";
import { buildMinimizedShadowDossier, getOpenRouterShadowConfig, OpenRouterProvider } from "./providers/openrouter-provider";

const input: TutorTurnRequest = {
  userId: "private-user-id",
  sessionId: "private-session-id",
  itemId: "v4-item-1",
  message: "Ayúdame; mi correo es persona@example.com y mira /opt/gcm/env/secret",
  evidence: {
    question: {
      itemId: "v4-item-1",
      area: "pedagogia",
      competency: "evaluacion",
      topic: "evaluacion_formativa",
      context: "Caso pedagógico",
      cognitiveIntent: "Aplicar",
      expectedUserTask: "Comparar opciones",
      sourceType: "official_source",
      sourceRefs: ["/opt/internal/source.pdf"],
      stem: "¿Qué debe hacer?",
      options: [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
        { key: "C", text: "C" },
        { key: "D", text: "D" },
      ],
      correctOption: "B",
      correctExplanation: "B es correcta",
    },
    userSession: {
      sessionId: "private-session-id",
      userId: "private-user-id",
      selectedContestId: "contest-1",
      selectedProfileId: "profile-1",
      currentItemId: "v4-item-1",
    },
  },
};

test("shadow dossier redacts identity-like text, paths and pre-answer truth", () => {
  const serialized = JSON.stringify(buildMinimizedShadowDossier(input));
  assert.doesNotMatch(serialized, /private-user-id|private-session-id|persona@example\.com|\/opt\/gcm|\/opt\/internal/);
  assert.doesNotMatch(serialized, /correctOption|correctExplanation|explanations|learningNote/);
  assert.match(serialized, /email-redacted|path-redacted/);
});

test("OpenRouter request fixes provider privacy controls and strict schema", async () => {
  let requestBody: any;
  const fetchMock = async (_url: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Revisa la tarea esperada sin pedir la clave.",
        pedagogicalAction: "hint",
        evidenceKeys: ["question"],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      }) } }],
      usage: { prompt_tokens: 100, completion_tokens: 30 },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const provider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    fetchMock as typeof fetch,
  );

  const result = await provider.generate(input);
  assert.equal(result.status, "accepted");
  assert.deepEqual(requestBody.provider, {
    order: ["approved-provider"],
    only: ["approved-provider"],
    allow_fallbacks: false,
    require_parameters: true,
    data_collection: "deny",
    zdr: true,
  });
  assert.equal(requestBody.response_format.type, "json_schema");
  assert.equal(requestBody.response_format.json_schema.strict, true);
  assert.equal(requestBody.response_format.json_schema.schema.additionalProperties, false);
  assert.equal(requestBody.plugins, undefined);
  assert.equal(requestBody.tools, undefined);
});

test("unsafe pre-answer output is rejected and shadow stays opt-in", async () => {
  const fetchMock = async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({
      schemaVersion: "tutor-shadow-v1",
      visibleMessage: "La respuesta correcta es B",
      pedagogicalAction: "feedback",
      evidenceKeys: ["question"],
      uncertainty: "none",
      requiresDeterministicFallback: false,
    }) } }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const provider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    fetchMock as typeof fetch,
  );
  assert.equal((await provider.generate(input)).status, "rejected");
  assert.equal(getOpenRouterShadowConfig({}), null);
  assert.equal(getOpenRouterShadowConfig({ GCM_TUTOR_LLM_SHADOW: "1", OPENROUTER_API_KEY: "x" }), null);
});
