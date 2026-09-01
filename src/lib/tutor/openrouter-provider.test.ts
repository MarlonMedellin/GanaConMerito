import assert from "node:assert/strict";
import test from "node:test";
import type { TutorTurnRequest } from "../../types/tutor-turn";
import { APPROVED_OPENROUTER_MODEL, APPROVED_OPENROUTER_PROVIDER, buildMinimizedShadowDossier, getOpenRouterShadowConfig, getOpenRouterVisibleConfig, OpenRouterProvider, resetOpenRouterCircuitForTests, validateShadowSafety } from "./providers/openrouter-provider";

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
      sourceId: "col-decreto-1290-evaluacion-estudiantes",
      sourceRefs: ["/opt/internal/source.pdf"],
      resolvedSources: [
        {
          sourceId: "col-decreto-1290-evaluacion-estudiantes",
          reference: "Decreto 1290 de 2009",
          title: "Evaluación del aprendizaje",
          sourceType: "normative",
          relationType: "decisive",
          locator: "artículo 3",
          sourceTruthStatus: "source_verified",
          knowledgeLevel: "B",
        },
        {
          sourceId: "legacy-concurso-docente-2016",
          reference: "Material histórico concurso docente 2016",
          title: "Antecedente histórico",
          sourceType: "historical",
          relationType: "supporting",
          sourceTruthStatus: "source_verified",
          knowledgeLevel: "F",
        },
      ],
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
  const dossier = buildMinimizedShadowDossier(input);
  const serialized = JSON.stringify(dossier);
  assert.doesNotMatch(serialized, /private-user-id|private-session-id|persona@example\.com|\/opt\/gcm|\/opt\/internal/);
  assert.doesNotMatch(serialized, /correctOption|correctExplanation|explanations|learningNote/);
  assert.match(serialized, /email-redacted|path-redacted/);
  assert.deepEqual(dossier.question?.sourceEvidence, [
    {
      sourceId: "col-decreto-1290-evaluacion-estudiantes",
      reference: "Decreto 1290 de 2009",
      relationType: "decisive",
      locator: "artículo 3",
      sourceTruthStatus: "source_verified",
      knowledgeLevel: "B",
    },
    {
      sourceId: "legacy-concurso-docente-2016",
      reference: "Material histórico concurso docente 2016",
      relationType: "supporting",
      locator: undefined,
      sourceTruthStatus: "source_verified",
      knowledgeLevel: "F",
    },
  ]);
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
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }],
        sourceClaims: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", claim: "used_as_evidence" }],
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
  assert.equal(requestBody.max_completion_tokens, 400);
  assert.equal(requestBody.max_tokens, undefined);
  assert.equal(requestBody.plugins, undefined);
  assert.equal(requestBody.tools, undefined);
});

test("unsafe pre-answer output is schema-valid but rejected by candidate safety", async () => {
  resetOpenRouterCircuitForTests();
  const unsafeOutput = {
    schemaVersion: "tutor-shadow-v1" as const,
    visibleMessage: "La respuesta correcta es B",
    pedagogicalAction: "hint" as const,
    evidenceKeys: ["question", "source_evidence"],
    sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
    sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }],
    sourceClaims: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", claim: "used_as_evidence" as const }],
    uncertainty: "none" as const,
    requiresDeterministicFallback: false,
  };
  const fetchMock = async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(unsafeOutput) } }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const provider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    fetchMock as typeof fetch,
  );
  const result = await provider.generate(input);
  assert.equal(result.status, "accepted");
  assert.deepEqual(validateShadowSafety(unsafeOutput, input), { ok: false, reason: "pre_answer_leak" });
});

test("OpenRouter shadow and visible config are independently opt-in", () => {
  assert.equal(getOpenRouterShadowConfig({}), null);
  assert.equal(getOpenRouterShadowConfig({ GCM_TUTOR_LLM_SHADOW: "1", OPENROUTER_API_KEY: "x" }), null);
  assert.equal(getOpenRouterShadowConfig({
    GCM_TUTOR_LLM_SHADOW: "1",
    OPENROUTER_API_KEY: "x",
    OPENROUTER_MODEL: "unapproved/model",
    OPENROUTER_PROVIDER: APPROVED_OPENROUTER_PROVIDER,
  }), null);
  assert.deepEqual(getOpenRouterShadowConfig({
    GCM_TUTOR_LLM_SHADOW: "1",
    OPENROUTER_API_KEY: "x",
    OPENROUTER_MODEL: APPROVED_OPENROUTER_MODEL,
    OPENROUTER_PROVIDER: APPROVED_OPENROUTER_PROVIDER,
  }), {
    apiKey: "x",
    model: APPROVED_OPENROUTER_MODEL,
    provider: APPROVED_OPENROUTER_PROVIDER,
  });
  assert.equal(getOpenRouterVisibleConfig({
    GCM_TUTOR_LLM_SHADOW: "1",
    OPENROUTER_API_KEY: "x",
    OPENROUTER_MODEL: APPROVED_OPENROUTER_MODEL,
    OPENROUTER_PROVIDER: APPROVED_OPENROUTER_PROVIDER,
  }), null);
  assert.deepEqual(getOpenRouterVisibleConfig({
    GCM_TUTOR_LLM_VISIBLE: "1",
    OPENROUTER_API_KEY: "x",
    OPENROUTER_MODEL: APPROVED_OPENROUTER_MODEL,
    OPENROUTER_PROVIDER: APPROVED_OPENROUTER_PROVIDER,
  }), {
    apiKey: "x",
    model: APPROVED_OPENROUTER_MODEL,
    provider: APPROVED_OPENROUTER_PROVIDER,
  });
});

test("candidate safety rejects invented source ids, source mismatches and historical current claims", () => {
  const cases = [
    {
      output: {
        sourceIdsUsed: ["invented-source"],
        sourceCitationsUsed: [],
        sourceClaims: [],
      },
      errorCode: "invented_source_id",
    },
    {
      output: {
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Referencia inventada" }],
        sourceClaims: [],
      },
      errorCode: "source_reference_mismatch",
    },
    {
      output: {
        sourceIdsUsed: ["legacy-concurso-docente-2016"],
        sourceCitationsUsed: [{ sourceId: "legacy-concurso-docente-2016", reference: "Material histórico concurso docente 2016" }],
        sourceClaims: [{ sourceId: "legacy-concurso-docente-2016", claim: "presented_as_current" as const }],
      },
      errorCode: "historical_source_misuse",
    },
  ];

  for (const testCase of cases) {
    const result = validateShadowSafety({
      schemaVersion: "tutor-shadow-v1",
      visibleMessage: "Salida simulada.",
      pedagogicalAction: "hint",
      evidenceKeys: ["question", "source_evidence"],
      ...testCase.output,
      uncertainty: "limited",
      requiresDeterministicFallback: false,
    }, input);
    assert.deepEqual(result, { ok: false, reason: testCase.errorCode });
  }
});

test("OpenRouter retries one transient 429 or 5xx and rejects invalid JSON", async () => {
  for (const status of [429, 503]) {
    resetOpenRouterCircuitForTests();
    let calls = 0;
    const fetchMock = async () => {
      calls += 1;
      return new Response(calls === 1 ? "transient" : "still unavailable", { status });
    };
    const provider = new OpenRouterProvider(
      { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
      fetchMock as typeof fetch,
    );
    assert.equal((await provider.generate(input)).errorCode, `http_${status}`);
    assert.equal(calls, 2);
  }

  resetOpenRouterCircuitForTests();
  const invalidJsonProvider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    (async () => new Response("not-json", { status: 200 })) as typeof fetch,
  );
  assert.equal((await invalidJsonProvider.generate(input)).errorCode, "invalid_json");
});

test("OpenRouter applies a hard timeout and fails closed", async () => {
  resetOpenRouterCircuitForTests();
  const fetchMock = ((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  })) as typeof fetch;
  const provider = new OpenRouterProvider(
    { apiKey: "test-secret", model: "approved/model", provider: "approved-provider" },
    fetchMock,
    5,
  );
  const result = await provider.generate(input);
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "network_or_timeout");
  assert.ok(result.latencyMs < 500);
});
