import assert from "node:assert/strict";
import test from "node:test";
import type { TutorProvider, TutorShadowExecution } from "../src/lib/tutor/providers/tutor-provider";
import type { TutorTurnRequest } from "../src/types/tutor-turn";
import { runG6TutorShadowReadiness, type G6ShadowScenario } from "./lib/g6-tutor-shadow-readiness";
import { APPROVED_OPENROUTER_MODEL, APPROVED_OPENROUTER_PROVIDER, OpenRouterProvider } from "../src/lib/tutor/providers/openrouter-provider";
import { assertLiveEnvironment, createG6TutorShadowRunOptions } from "./qa-g6-tutor-shadow";

function input(params: {
  selectedOption?: string;
  correctOption?: string;
  knowledgeLevel?: string;
} = {}): TutorTurnRequest {
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
          {
            sourceId: "legacy-concurso-docente-2016",
            reference: "Material histórico concurso docente 2016",
            relationType: "supporting",
            sourceTruthStatus: "source_verified",
            knowledgeLevel: params.knowledgeLevel ?? "F",
          },
        ],
        stem: "¿Qué acción procede?",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
          { key: "C", text: "C" },
          { key: "D", text: "D" },
        ],
        ...(params.correctOption ? {
          correctOption: params.correctOption,
          explanations: { [params.correctOption]: "Baseline determinístico." },
          learningNote: "Nota determinística.",
        } : {}),
      },
      userSession: {
        sessionId: "qa-session",
        userId: "qa-user",
        selectedContestId: "contest",
        selectedProfileId: "profile",
        currentItemId: "DOC-000001",
        selectedOption: params.selectedOption,
        feedback: params.selectedOption ? "Feedback determinístico." : undefined,
      },
    },
  };
}

class MockProvider implements TutorProvider<TutorShadowExecution> {
  readonly name = "mock";

  constructor(private readonly execution?: TutorShadowExecution) {}

  async generate(request: TutorTurnRequest): Promise<TutorShadowExecution> {
    if (this.execution) return this.execution;
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

function validLiveEnv(): Record<string, string | undefined> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: "https://dhiytzbwodfvdrnwhkcw.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
    GCM_TUTOR_LLM_SHADOW: "1",
    OPENROUTER_API_KEY: "openrouter-test",
    OPENROUTER_MODEL: APPROVED_OPENROUTER_MODEL,
    OPENROUTER_PROVIDER: APPROVED_OPENROUTER_PROVIDER,
  };
}

function fakeRepository() {
  const practice = {
    id: "DOC-000001",
    title: null,
    area: "evaluacion",
    topic: "evaluacion_formativa",
    competency: "decision_pedagogica",
    difficulty: 0.5,
    context: "Contexto",
    stem: "¿Qué acción procede?",
    questionType: "situational",
    cognitiveLevel: "apply",
    sourceReference: null,
    sourceId: null,
    sourceType: "runtime_v4",
    sourcePath: null,
    scope: "general",
    hint: "Pista",
    tags: null,
    options: [
      { key: "A" as const, text: "A" },
      { key: "B" as const, text: "B" },
      { key: "C" as const, text: "C" },
      { key: "D" as const, text: "D" },
    ],
  };
  return {
    async listCandidates() {
      return [{ id: "DOC-000001" }, { id: "DOC-000002" }];
    },
    async getPracticeQuestion(itemId: string) {
      return { ...practice, id: itemId };
    },
    async getAnsweredQuestion(itemId: string) {
      return {
        id: itemId,
        correctOption: "B" as const,
        difficulty: 0.5,
        area: "evaluacion",
        competency: "decision_pedagogica",
        explanations: { B: "Baseline determinístico." },
        learningNote: "Nota determinística.",
      };
    },
    async getQuestionSources() {
      return [
        {
          sourceId: "col-decreto-1290-evaluacion-estudiantes",
          reference: "Decreto 1290 de 2009",
          title: "Evaluación",
          sourceType: "normative",
          relationType: "decisive",
          locator: "artículo 3",
          verificationStatus: "verified",
          knowledgeLevel: "B",
        },
      ];
    },
  };
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
  assert.deepEqual(artifact.scenarios[0].expectedSourceIds, [
    "col-decreto-1290-evaluacion-estudiantes",
    "legacy-concurso-docente-2016",
  ]);
  assert.deepEqual(artifact.scenarios[0].sourceIdsUsed, ["col-decreto-1290-evaluacion-estudiantes"]);
  assert.equal(artifact.scenarios[0].shadowOutputText, "Pista simulada.");
  assert.equal(artifact.scenarios[0].pedagogicalUtility, "REVIEW_REQUIRED");
  assert.equal(artifact.scenarios[0].contradictionReview, "REVIEW_REQUIRED");
  assert.equal(artifact.scenarios[0].contradictionDetected, null);
});

test("G6 live mode selects OpenRouterProvider with valid config without calling OpenRouter", async () => {
  const options = await createG6TutorShadowRunOptions({
    live: true,
    env: validLiveEnv(),
    repository: fakeRepository(),
  });

  assert.equal(options.model, APPROVED_OPENROUTER_MODEL);
  assert.equal(options.liveOpenRouter, "ready");
  assert.equal(options.provider instanceof OpenRouterProvider, true);
  assert.equal(options.scenarios.length, 3);
  assert.equal(options.scenarios[0].mode, "pre_answer");
  assert.equal(options.scenarios[0].input.evidence.question?.correctOption, undefined);
  assert.equal(options.scenarios[0].input.evidence.question?.explanations, undefined);
  assert.equal(options.scenarios[0].input.evidence.question?.learningNote, undefined);
  assert.equal(options.scenarios[1].mode, "post_answer");
  assert.equal(options.scenarios[1].input.evidence.question?.correctOption, "B");
  assert.equal(options.scenarios[2].mode, "adversarial");
});

test("G6 live mode fails closed without valid OpenRouter config", () => {
  assert.throws(() => assertLiveEnvironment({
    ...validLiveEnv(),
    OPENROUTER_API_KEY: undefined,
  }), /OpenRouter shadow configuration/);
});

test("G6 live mode fails closed outside Candidate Supabase", () => {
  assert.throws(() => assertLiveEnvironment({
    ...validLiveEnv(),
    NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co",
  }), /Candidate Supabase project/);
});

test("G6 artifact preserves shadow output and deterministic baseline for audit", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "post_answer", input: input({ selectedOption: "A", correctOption: "B" }) }],
    provider: new MockProvider(),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });

  const scenario = artifact.scenarios[0];
  assert.equal(scenario.shadowOutputText, "Pista simulada.");
  assert.equal(scenario.deterministicBaseline.selectedOption, "A");
  assert.equal(scenario.deterministicBaseline.correctOption, "B");
  assert.deepEqual(scenario.deterministicBaseline.explanations, { B: "Baseline determinístico." });
  assert.equal(scenario.deterministicBaseline.learningNote, "Nota determinística.");
  assert.equal(scenario.expectedSources.length, 2);
  assert.deepEqual(scenario.sourceCitationsUsed, [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }]);
});

test("G6 artifact keeps invented source rejections objective", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "post_answer", input: input({ selectedOption: "A", correctOption: "B" }) }],
    provider: new MockProvider({
      status: "accepted",
      latencyMs: 10,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Texto.",
        pedagogicalAction: "feedback",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["invented-source"],
        sourceCitationsUsed: [],
        sourceClaims: [],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    }),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });
  assert.equal(artifact.scenarios[0].inventedSourceDetected, true);
  assert.equal(artifact.scenarios[0].safetyReason, "invented_source_id");
});

test("G6 artifact keeps reference mismatch rejections objective", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "post_answer", input: input({ selectedOption: "A", correctOption: "B" }) }],
    provider: new MockProvider({
      status: "accepted",
      latencyMs: 10,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Texto.",
        pedagogicalAction: "feedback",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Referencia inventada" }],
        sourceClaims: [],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    }),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });
  assert.equal(artifact.scenarios[0].sourceMismatchDetected, true);
  assert.equal(artifact.scenarios[0].safetyReason, "source_reference_mismatch");
});

test("G6 artifact keeps historical F presented as current rejected", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "adversarial", input: input({ knowledgeLevel: "F" }) }],
    provider: new MockProvider({
      status: "accepted",
      latencyMs: 10,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Texto.",
        pedagogicalAction: "hint",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["legacy-concurso-docente-2016"],
        sourceCitationsUsed: [{ sourceId: "legacy-concurso-docente-2016", reference: "Material histórico concurso docente 2016" }],
        sourceClaims: [{ sourceId: "legacy-concurso-docente-2016", claim: "presented_as_current" }],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    }),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });
  assert.equal(artifact.scenarios[0].historicalMisuseDetected, true);
  assert.equal(artifact.scenarios[0].safetyReason, "historical_source_misuse");
});

test("G6 artifact keeps pre-answer answer leak rejected", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "pre_answer", input: input() }],
    provider: new MockProvider({
      status: "accepted",
      latencyMs: 10,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "La respuesta correcta es B.",
        pedagogicalAction: "hint",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }],
        sourceClaims: [],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    }),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });
  assert.equal(artifact.scenarios[0].preAnswerLeakDetected, true);
  assert.equal(artifact.scenarios[0].safetyReason, "pre_answer_leak");
});

test("G6 contradiction and utility remain human review when objective guard cannot decide", async () => {
  const artifact = await runG6TutorShadowReadiness({
    scenarios: [{ itemId: "DOC-000001", mode: "post_answer", input: input({ selectedOption: "A", correctOption: "B" }) }],
    provider: new MockProvider({
      status: "accepted",
      latencyMs: 10,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Revisa la justificación y contrástala con la retroalimentación.",
        pedagogicalAction: "feedback",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: ["col-decreto-1290-evaluacion-estudiantes"],
        sourceCitationsUsed: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", reference: "Decreto 1290 de 2009" }],
        sourceClaims: [{ sourceId: "col-decreto-1290-evaluacion-estudiantes", claim: "used_as_evidence" }],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    }),
    candidateProjectRef: "dhiytzbwodfvdrnwhkcw",
    model: "mock",
    writeArtifact: false,
  });
  assert.equal(artifact.scenarios[0].contradictionDetected, null);
  assert.equal(artifact.scenarios[0].contradictionReview, "REVIEW_REQUIRED");
  assert.equal(artifact.scenarios[0].pedagogicalUtility, "REVIEW_REQUIRED");
});
