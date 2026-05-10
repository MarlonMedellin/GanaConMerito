import { buildTutorSupportContract } from "../../lib/tutor/normative-source-truth";
import type { QuestionTruth, TutorSupportContract } from "../../types/tutor-turn";
import type { NormalizedRichItem } from "../taxonomy/normalize-item";

export interface QuestionTruthCore {
  itemId: string;
  stem: string;
  correctOption: string;
  correctExplanation: string;
}

export interface QuestionTaxonomyMetadata {
  area: string;
  competency: string;
  topic: string;
}

export interface QuestionPedagogicalMetadata {
  cognitiveIntent: string;
  expectedUserTask: string;
}

export interface QuestionPsychometricMetadata {
  dificultad?: string;
  nivelCognitivo?: string;
}

export interface QuestionEditorialMetadata {
  sourceType: string;
  sourceRefs: string[];
}

export interface QuestionRiskMetadata {
  sourceTruthStatus: QuestionTruth["sourceTruthStatus"];
}

export interface TutorInstructionalContract {
  instructionalGoal: string;
  canonicalRationale: string;
}

export interface TutorHintContract {
  hintLadder: NonNullable<TutorSupportContract["hintLadder"]>;
}

export interface TutorMisconceptionContract {
  misconceptionMap: NonNullable<TutorSupportContract["misconceptionMap"]>;
}

export interface TutorRiskContract {
  qualityFlags: string[];
}

export interface TutorSourceTruthContract {
  sourceTruthRefs: string[];
  normativeReasoning?: string;
  responsePolicy?: TutorSupportContract["responsePolicy"];
}

export function richItemToQuestionTruth(
  item: NormalizedRichItem,
  options: QuestionTruth["options"],
  correctOption: string,
  correctExplanation: string,
): QuestionTruth {
  const area = item.taxonomy.area ?? "general";
  const competency = item.taxonomy.competency ?? "competencia no especificada";
  const topic = [item.taxonomy.area, item.taxonomy.subarea, item.taxonomy.competency].filter(Boolean).join(" - ") || [area, competency].join(" - ");

  const core: QuestionTruthCore = { itemId: item.itemId, stem: item.stem, correctOption, correctExplanation };
  const taxonomy: QuestionTaxonomyMetadata = {
    area,
    competency,
    topic,
  };
  const pedagogical: QuestionPedagogicalMetadata = {
    cognitiveIntent: "Identificar la opción que mejor responde al caso según el enunciado y la competencia evaluada.",
    expectedUserTask: "Leer el enunciado, contrastar opciones y seleccionar la alternativa más consistente.",
  };
  const psychometric: QuestionPsychometricMetadata = {
    dificultad: item.taxonomy.dificultad,
    nivelCognitivo: item.taxonomy.nivel_cognitivo,
  };
  const editorial: QuestionEditorialMetadata = { sourceType: item.sourceType, sourceRefs: item.sourceRefs };
  const risk: QuestionRiskMetadata = { sourceTruthStatus: item.sourceTruthStatus };
  const governanceSummary = item.governanceWarnings.length
    ? `La taxonomía del item se normalizó parcialmente y conserva campos faltantes o no gobernados: ${item.governanceWarnings.join("; ")}`
    : undefined;

  return {
    ...core,
    ...taxonomy,
    ...pedagogical,
    sourceType: editorial.sourceType,
    sourceRefs: editorial.sourceRefs,
    options,
    sourceTruthStatus: risk.sourceTruthStatus,
    canonicalRationale: correctExplanation,
    normativeReasoning: governanceSummary,
  };
}

export function questionTruthToTutorSupportContract(question: QuestionTruth): TutorSupportContract {
  const base = buildTutorSupportContract(question) ?? {};
  const qualityFlags = [...new Set([...(base.qualityFlags ?? []), "semantic_governance_v1"])];

  const instructional: TutorInstructionalContract = {
    instructionalGoal:
      base.instructionalGoal ?? `Fortalecer ${question.competency} sin revelar la clave antes de la respuesta del usuario.`,
    canonicalRationale: base.canonicalRationale ?? question.correctExplanation,
  };
  const hints: TutorHintContract = {
    hintLadder:
      base.hintLadder ?? [
        { level: 1, hint: `Identifica la tarea esperada: ${question.expectedUserTask}` },
        { level: 2, hint: "Contrasta cada opción con la competencia declarada." },
        { level: 3, hint: "Justifica tu elección con evidencia del enunciado." },
      ],
  };
  const misconception: TutorMisconceptionContract = {
    misconceptionMap:
      base.misconceptionMap ?? [{ misconception: "Elegir por intuición", safeRedirect: "Vuelve al criterio de la competencia." }],
  };
  const risk: TutorRiskContract = { qualityFlags };
  const source: TutorSourceTruthContract = {
    sourceTruthRefs: question.sourceRefs,
    normativeReasoning: question.normativeReasoning ?? base.normativeReasoning,
    responsePolicy: base.responsePolicy,
  };

  return {
    ...base,
    ...instructional,
    ...hints,
    ...misconception,
    ...risk,
    ...source,
  };
}
