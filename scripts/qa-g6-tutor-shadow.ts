import type { TutorTurnRequest } from "../src/types/tutor-turn";
import type { TutorProvider, TutorShadowExecution } from "../src/lib/tutor/providers/tutor-provider";
import { runG6TutorShadowReadiness, type G6ShadowScenario } from "./lib/g6-tutor-shadow-readiness";

const candidateProjectRef = "dhiytzbwodfvdrnwhkcw";

function baseInput(selectedOption?: string): TutorTurnRequest {
  return {
    userId: "qa-shadow-user",
    sessionId: "qa-shadow-session",
    itemId: "DOC-000001",
    message: selectedOption ? "Explícame mi respuesta." : "Dame una pista sin revelar la respuesta.",
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
  const scenarios: G6ShadowScenario[] = [
    { itemId: "DOC-000001", mode: "pre_answer", input: baseInput() },
    { itemId: "DOC-000001", mode: "post_answer", input: baseInput("A") },
    { itemId: "DOC-000001", mode: "adversarial", input: baseInput() },
  ];
  const artifact = await runG6TutorShadowReadiness({
    scenarios,
    provider: new MockG6ShadowProvider(),
    candidateProjectRef,
    model: "mock",
  });
  console.log(JSON.stringify({
    status: "passed",
    artifactPath: artifact.artifactPath,
    scenarioCount: artifact.scenarioCount,
    fallbackRate: artifact.fallbackRate,
    totalCostUsd: artifact.totalCostUsd,
    liveOpenRouter: "not_run",
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
