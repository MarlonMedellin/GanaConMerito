import { TUTOR_CONTRACT_VERSION } from "../../domain/tutor/contract";
import type { AspirationalProfileTruth, ContestTruth, QuestionTruth, SourceTruthStatus, TutorSupportContract } from "../../types/tutor-turn";

export const NORMATIVE_SOURCE_TRUTH_VERSION = `${TUTOR_CONTRACT_VERSION}:normative-synth-v1`;

export const SYNTHETIC_NORMATIVE_SOURCE_STATUS: SourceTruthStatus = "synthesized_governed_unverified";

const DEFAULT_CONTEST_ID = "cnsc-docente-directivo-docente-v1";

const SOURCE_REFS = [
  "docs/01-product/source-truth/normative-source-truth-v1.md",
  "runtime:item_bank",
  "runtime:professional_profiles",
];

export function buildContestTruthV1(): ContestTruth { return {
    contestId: DEFAULT_CONTEST_ID, contestName: "Concurso docente y directivo docente", agreementId: "agreement-source-pending", methodologicalGuideId: "methodological-guide-source-pending", testStructureId: "test-structure-source-pending",
    evaluationStructureSummary: "La evaluación se interpreta como una prueba de juicio aplicado: el usuario debe leer una situación, identificar la competencia evaluada y escoger la alternativa más consistente con la guía del concurso y el propósito del empleo. La estructura normativa detallada queda pendiente de carga desde acuerdos y guías metodológicas oficiales.",
    evaluationRulesSummary: "El Tutor GCM puede orientar lectura, comparación de opciones y explicación pedagógica, pero no modifica puntaje, no avanza la sesión, no cierra sesión y no inventa reglas normativas no cargadas.",
    sourceTruthVersion: NORMATIVE_SOURCE_TRUTH_VERSION, sourceTruthStatus: SYNTHETIC_NORMATIVE_SOURCE_STATUS, sourceTruthRefs: SOURCE_REFS,
    insufficientSourceReason: "La versión v1 contiene una síntesis gobernada mínima. Los textos oficiales completos de acuerdo, guía metodológica y estructura de prueba aún no están cargados como fuente verificable en el repositorio.",
  }; }

export function buildAspirationalProfileTruthV1(profile: { id: string; name?: string | null; description?: string | null; area?: string | null } | null): AspirationalProfileTruth | undefined {
  if (!profile) return undefined;
  const jobName = profile.name ?? "Perfil docente seleccionado";
  const performanceArea = profile.area ?? "educacion";
  const description = profile.description ?? "Perfil aspiracional seleccionado por el usuario.";
  return { profileId: profile.id, contestId: DEFAULT_CONTEST_ID, jobName, hierarchicalLevel: "Docente / directivo docente según convocatoria específica", performanceArea, purposeSummary: description,
    functionSummary: "El desempeño esperado se resume en analizar situaciones institucionales o pedagógicas y tomar decisiones consistentes con el rol al que aspira el usuario. Las funciones específicas deben cargarse desde la convocatoria y manual aplicable.",
    functionalCompetencySummary: "Las competencias funcionales se usan como criterio pedagógico general: comprender el problema, aplicar el marco del rol, justificar decisiones y priorizar acciones pertinentes al servicio educativo. No reemplaza el manual específico del empleo.",
    behavioralCompetencySummary: "Las competencias comportamentales se tratan en clave general según el marco público colombiano: orientación al resultado, compromiso con lo público, trabajo en equipo, adaptación, aprendizaje continuo, comunicación y criterio ético. La app no presenta esta síntesis como transcripción oficial.",
    mipgAlignmentSummary: "La alineación MIPG se expresa de forma general: decisiones orientadas a planeación, mejora, servicio, gestión de información, transparencia y valor público. La fuente detallada del concurso debe cargarse antes de usar referencias normativas específicas.",
    sourceTruthStatus: SYNTHETIC_NORMATIVE_SOURCE_STATUS, sourceTruthRefs: SOURCE_REFS };
}

export function enrichQuestionTruthWithNormativeSource(question: QuestionTruth): QuestionTruth {
  return { ...question, evaluatesCompetency: true, userExpectedAnswer: question.expectedUserTask || "Seleccionar la alternativa que responde mejor al caso según la competencia evaluada y justificar brevemente la decisión.",
    normativeAlignmentSummary: "Esta pregunta se trata como evidencia pedagógica de la competencia declarada en el banco activo. La alineación normativa fina debe validarse contra la guía metodológica y el acuerdo específico del concurso cuando esas fuentes estén cargadas.",
    sourceTruthStatus: question.sourceTruthStatus ?? SYNTHETIC_NORMATIVE_SOURCE_STATUS, sourceRefs: [...new Set([...question.sourceRefs, ...SOURCE_REFS])] };
}

export function getNormativeSourceTruthRefs(): string[] { return SOURCE_REFS; }

export function buildTutorSupportContract(question?: QuestionTruth): TutorSupportContract | undefined {
  if (!question) return undefined;
  const topicDetail = [question.area, question.subarea, question.competency].filter(Boolean).join(" → ");
  const affirmation = question.affirmation ? ` Afirmación evaluada: ${question.affirmation}.` : "";
  const evidenceCue = question.evidenceStatement ? ` Evidencia esperada: ${question.evidenceStatement}.` : "";
  const contextHint = question.context ? ` Contexto de ítem: ${question.context}.` : "";
  const levelHint = [question.difficulty, question.cognitiveLevel].filter(Boolean).join(" / ");
  const riskFlags = Array.isArray(question.technicalRisks) ? question.technicalRisks : (question.technicalRisks?.notes ?? []);

  return {
    instructionalGoal: `Fortalecer ${topicDetail || question.competency} sin revelar la clave antes de la respuesta del usuario.${contextHint}${affirmation}${evidenceCue}`,
    canonicalRationale: question.canonicalRationale ?? question.correctExplanation,
    misconceptionMap: [
      ...(question.misconceptionMap ?? []).map((entry) => ({ misconception: entry.feedback, safeRedirect: "Revisa el enunciado, la competencia y la tarea esperada antes de decidir.", pattern: entry.pattern })),
      ...(question.distractorRationales ? Object.entries(question.distractorRationales).map(([key, rationale]) => ({ misconception: `Distractor ${key}: ${rationale}`, safeRedirect: "Contrasta la evidencia del enunciado contra la afirmación central antes de seleccionar." })) : []),
      { misconception: "Elegir por intuición sin contrastar el enunciado con la competencia evaluada.", safeRedirect: "Vuelve a la tarea esperada y compara cada opción contra ese criterio antes de elegir." },
      ...(riskFlags.length > 0 ? [{ misconception: `Riesgo técnico reportado: ${riskFlags.join(", ")}`, safeRedirect: "Si detectas ambigüedad o posible doble clave, responde con la mejor justificación y marca la duda de forma explícita." }] : []),
    ],
    hintLadder: [
      { level: 1, hint: `Ubica qué pide exactamente la tarea esperada: ${question.expectedUserTask}` },
      { level: 2, hint: `Contrasta señales del caso contra ${question.subarea ?? question.competency} antes de mirar la letra.` },
      { level: 3, hint: `Justifica tu elección con una razón y una alternativa descartada${levelHint ? ` (nivel ${levelHint})` : ""}, sin pedir la clave${question.targetPosition ? ` y considerando el rol ${question.targetPosition}` : ""}.` },
    ],
    normativeReasoning: question.normativeReasoning ?? question.evidenceStatement ?? question.normativeAlignmentSummary ?? "Usa la fuente normativa sintetizada solo como orientación general y degrada si falta evidencia específica.",
    responsePolicy: { noRevealCorrectAnswer: true, noRevealCorrectLetter: true, noOptionEliminationByDiscard: true, noVerbatimCorrectOptionQuote: true, noScoring: true, noAttemptStateMutation: true },
    qualityFlags: ["sidecar_minimal", "backward_compatible", "safe_fallback", ...(question.distractorRationales ? ["distractor_rationales_available"] : []), ...(riskFlags.length > 0 ? ["technical_risk_caution"] : []), ...(question.targetPosition ? [`target_position:${question.targetPosition}`] : []), ...(question.applicantProfile ? [`applicant_profile:${question.applicantProfile}`] : [])],
    sourceTruthRefs: question.sourceRefs,
  };
}
