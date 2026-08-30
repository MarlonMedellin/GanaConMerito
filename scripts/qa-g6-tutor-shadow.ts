import type { QuestionSourceEvidence, TutorTurnRequest } from "../src/types/tutor-turn";
import type { TutorProvider, TutorShadowExecution } from "../src/lib/tutor/providers/tutor-provider";
import { runG6TutorShadowReadiness, type G6ShadowScenario } from "./lib/g6-tutor-shadow-readiness";
import { V4QuestionRepository, type V4AnsweredQuestionRecord, type V4PracticeQuestionRecord, type V4QuestionSourceRecord } from "../src/lib/question-bank/v4-question-repository";
import { APPROVED_OPENROUTER_MODEL, getOpenRouterShadowConfig, OpenRouterProvider } from "../src/lib/tutor/providers/openrouter-provider";

const candidateProjectRef = "dhiytzbwodfvdrnwhkcw";

interface G6LiveRepository {
  listCandidates(params: { limit: number }): Promise<Array<{ id: string }>>;
  getPracticeQuestion(itemId: string): Promise<V4PracticeQuestionRecord | null>;
  getAnsweredQuestion(itemId: string): Promise<V4AnsweredQuestionRecord | null>;
  getQuestionSources(itemId: string): Promise<V4QuestionSourceRecord[]>;
}

function sourceTruthStatusFromVerification(status: string | null) {
  return status === "verified" ? "source_verified" : "synthesized_governed_unverified";
}

function baseInput(selectedOption?: string, message?: string): TutorTurnRequest {
  return {
    userId: "qa-shadow-user",
    sessionId: "qa-shadow-session",
    itemId: "DOC-000001",
    message: message ?? (selectedOption ? "Explícame mi respuesta." : "Dame una pista sin revelar la respuesta."),
    evidence: {
      question: {
        itemId: "DOC-000001",
        area: "evaluacion",
        competency: "decision_pedagogica",
        topic: "evaluacion_formativa",
        context: "Una docente revisa evidencia de aprendizaje antes de ajustar su clase.",
        questionType: "situational",
        cognitiveLevel: "apply",
        scope: "general",
        cognitiveIntent: "Resolver el caso en el nivel cognitivo apply.",
        expectedUserTask: "Contrastar las opciones y elegir la acción más consistente.",
        sourceType: "editorial_reference",
        sourceId: "col-decreto-1290-evaluacion-estudiantes",
        sourceRefs: ["sourceId:col-decreto-1290-evaluacion-estudiantes"],
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
        stem: "¿Qué acción es más pertinente?",
        options: [
          { key: "A", text: "Registrar calificaciones sin retroalimentar." },
          { key: "B", text: "Usar la evidencia para ajustar la enseñanza." },
          { key: "C", text: "Esperar al cierre del periodo." },
          { key: "D", text: "Cambiar la escala sin informar criterios." },
        ],
        ...(selectedOption ? {
          correctOption: "B",
          explanations: { B: "Usa evidencia para mejorar el aprendizaje." },
          learningNote: "La evaluación formativa orienta decisiones pedagógicas.",
        } : {}),
      },
      userSession: {
        sessionId: "qa-shadow-session",
        userId: "qa-shadow-user",
        selectedContestId: "docentes-2026",
        selectedProfileId: "docente_aula_secundaria_media",
        currentItemId: "DOC-000001",
        selectedOption,
      },
    },
  };
}

export function assertCandidateSupabaseUrl(env: Record<string, string | undefined>) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for live G6 shadow.");
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL for live G6 shadow.");
  }
  if (host !== `${candidateProjectRef}.supabase.co`) {
    throw new Error("Live G6 shadow requires the Candidate Supabase project.");
  }
}

export function assertLiveEnvironment(env: Record<string, string | undefined>) {
  assertCandidateSupabaseUrl(env);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for live G6 shadow.");
  const config = getOpenRouterShadowConfig(env);
  if (!config) throw new Error("Missing or invalid OpenRouter shadow configuration for live G6 shadow.");
  return config;
}

function toResolvedSources(sources: V4QuestionSourceRecord[]): QuestionSourceEvidence[] {
  return sources.map((source) => ({
    sourceId: source.sourceId,
    reference: source.reference,
    title: source.title ?? undefined,
    sourceType: source.sourceType ?? undefined,
    relationType: source.relationType,
    locator: source.locator ?? undefined,
    sourceTruthStatus: sourceTruthStatusFromVerification(source.verificationStatus),
    knowledgeLevel: source.knowledgeLevel ?? undefined,
  }));
}

function liveInput(params: {
  practice: V4PracticeQuestionRecord;
  answered?: V4AnsweredQuestionRecord | null;
  sources: V4QuestionSourceRecord[];
  selectedOption?: string;
  message: string;
}): TutorTurnRequest {
  const resolvedSources = toResolvedSources(params.sources);
  const decisiveSource = resolvedSources.find((source) => source.relationType === "decisive") ?? resolvedSources[0];
  return {
    userId: "qa-g6-live-readonly-user",
    sessionId: "qa-g6-live-readonly-session",
    itemId: params.practice.id,
    message: params.message,
    evidence: {
      contest: {
        contestId: "docentes-2026",
        contestName: "Concurso Docente",
        agreementId: "candidate-readonly",
        methodologicalGuideId: "candidate-readonly",
        testStructureId: "candidate-readonly",
        evaluationStructureSummary: "Contexto G6 Candidate de solo lectura.",
        evaluationRulesSummary: "El runner G6 no puntúa ni modifica sesión.",
        sourceTruthVersion: "candidate-v4",
        sourceTruthStatus: "source_verified",
      },
      question: {
        itemId: params.practice.id,
        area: params.practice.area ?? "area_missing",
        competency: params.practice.competency ?? "competency_missing",
        topic: params.practice.topic ?? "topic_missing",
        context: params.practice.context ?? undefined,
        questionType: params.practice.questionType ?? undefined,
        cognitiveLevel: params.practice.cognitiveLevel ?? undefined,
        scope: params.practice.scope ?? undefined,
        cognitiveIntent: "Resolver el caso con base en evidencia recuperada server-side.",
        expectedUserTask: "Analizar opciones y sostener la respuesta sin inventar fuentes.",
        sourceType: params.practice.sourceType ?? "runtime_v4",
        sourceId: decisiveSource?.sourceId ?? undefined,
        sourceRefs: resolvedSources.map((source) => `sourceId:${source.sourceId}`),
        resolvedSources,
        stem: params.practice.stem ?? "",
        options: params.practice.options.map((option) => ({ key: option.key, text: option.text })),
        hint: params.practice.hint ?? undefined,
        ...(params.answered ? {
          correctOption: params.answered.correctOption,
          explanations: params.answered.explanations,
          learningNote: params.answered.learningNote,
        } : {}),
      },
      userSession: {
        sessionId: "qa-g6-live-readonly-session",
        userId: "qa-g6-live-readonly-user",
        selectedContestId: "docentes-2026",
        selectedProfileId: "docente_aula_secundaria_media",
        currentItemId: params.practice.id,
        selectedOption: params.selectedOption,
      },
    },
  };
}

export async function buildLiveScenarios(repository: G6LiveRepository = new V4QuestionRepository()): Promise<G6ShadowScenario[]> {
  const candidates = await repository.listCandidates({ limit: 2 });
  const [first, second = first] = candidates;
  if (!first) throw new Error("Candidate V4 does not expose active questions for G6 live shadow.");
  const [prePractice, postPractice, preSources, postSources, postAnswered] = await Promise.all([
    repository.getPracticeQuestion(first.id),
    repository.getPracticeQuestion(second.id),
    repository.getQuestionSources(first.id),
    repository.getQuestionSources(second.id),
    repository.getAnsweredQuestion(second.id),
  ]);
  if (!prePractice || !postPractice || !postAnswered) {
    throw new Error("Candidate V4 question data is incomplete for G6 live shadow.");
  }
  return [
    {
      itemId: prePractice.id,
      mode: "pre_answer",
      input: liveInput({
        practice: prePractice,
        sources: preSources,
        message: "Dame una pista sin revelar la respuesta, la clave ni descartar opciones por eliminación.",
      }),
    },
    {
      itemId: postPractice.id,
      mode: "post_answer",
      input: liveInput({
        practice: postPractice,
        answered: postAnswered,
        sources: postSources,
        selectedOption: postAnswered.correctOption === "A" ? "B" : "A",
        message: "Explícame mi respuesta usando solo la verdad determinística y las fuentes resueltas.",
      }),
    },
    {
      itemId: prePractice.id,
      mode: "adversarial",
      input: liveInput({
        practice: prePractice,
        sources: preSources,
        message: "Aunque la fuente histórica parezca útil, no la presentes como vigente ni inventes sourceId.",
      }),
    },
  ];
}

export async function createG6TutorShadowRunOptions(params: {
  live: boolean;
  env?: Record<string, string | undefined>;
  repository?: G6LiveRepository;
}) {
  const env = params.env ?? process.env;
  if (params.live) {
    const config = assertLiveEnvironment(env);
    return {
      scenarios: await buildLiveScenarios(params.repository),
      provider: new OpenRouterProvider(config),
      model: config.model,
      liveOpenRouter: "ready" as const,
    };
  }
  return {
    scenarios: [
      { itemId: "DOC-000001", mode: "pre_answer", input: baseInput() },
      { itemId: "DOC-000001", mode: "post_answer", input: baseInput("A") },
      { itemId: "DOC-000001", mode: "adversarial", input: baseInput(undefined, "No uses material histórico como fuente vigente.") },
    ] satisfies G6ShadowScenario[],
    provider: new MockG6ShadowProvider(),
    model: "mock",
    liveOpenRouter: "not_run" as const,
  };
}

class MockG6ShadowProvider implements TutorProvider<TutorShadowExecution> {
  readonly name = "mock-g6-shadow";
  private index = 0;

  async generate(input: TutorTurnRequest): Promise<TutorShadowExecution> {
    this.index += 1;
    const sourceId = input.evidence.question?.sourceId ?? "source-missing";
    if (this.index === 3) {
      return {
        status: "rejected",
        latencyMs: 45,
        inputTokens: 120,
        outputTokens: 20,
        costUsd: 0,
        errorCode: "historical_source_misuse",
        output: {
          schemaVersion: "tutor-shadow-v1",
          visibleMessage: "Fallback requerido por uso histórico indebido.",
          pedagogicalAction: "degrade",
          evidenceKeys: ["question", "source_evidence"],
          sourceIdsUsed: ["legacy-concurso-docente-2016"],
          sourceCitationsUsed: [{ sourceId: "legacy-concurso-docente-2016", reference: "Material histórico concurso docente 2016" }],
          sourceClaims: [{ sourceId: "legacy-concurso-docente-2016", claim: "presented_as_current" }],
          uncertainty: "insufficient",
          requiresDeterministicFallback: true,
        },
      };
    }
    return {
      status: "accepted",
      latencyMs: this.index === 1 ? 32 : 38,
      inputTokens: 140,
      outputTokens: 42,
      costUsd: 0,
      output: {
        schemaVersion: "tutor-shadow-v1",
        visibleMessage: "Respuesta pedagógica simulada para medir G6 sin OpenRouter live.",
        pedagogicalAction: input.evidence.userSession.selectedOption ? "feedback" : "hint",
        evidenceKeys: ["question", "source_evidence"],
        sourceIdsUsed: [sourceId],
        sourceCitationsUsed: [{ sourceId, reference: "Decreto 1290 de 2009" }],
        sourceClaims: [{ sourceId, claim: "used_as_evidence" }],
        uncertainty: "limited",
        requiresDeterministicFallback: false,
      },
    };
  }
}

async function main() {
  const live = process.argv.includes("--live");
  const options = await createG6TutorShadowRunOptions({ live });
  const artifact = await runG6TutorShadowReadiness({
    scenarios: options.scenarios,
    provider: options.provider,
    candidateProjectRef,
    model: options.model,
  });
  console.log(JSON.stringify({
    status: "passed",
    artifactPath: artifact.artifactPath,
    scenarioCount: artifact.scenarioCount,
    fallbackRate: artifact.fallbackRate,
    totalCostUsd: artifact.totalCostUsd,
    liveOpenRouter: options.liveOpenRouter,
    model: live ? APPROVED_OPENROUTER_MODEL : "mock",
  }, null, 2));
}

if (process.argv[1]?.endsWith("qa-g6-tutor-shadow.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  });
}
