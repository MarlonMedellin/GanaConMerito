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
  dificultad: string;
  nivelCognitivo: string;
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
  normativeReasoning: string;
}

export function richItemToQuestionTruth(item: NormalizedRichItem, options: QuestionTruth["options"], correctOption: string, correctExplanation: string): QuestionTruth {
  const core: QuestionTruthCore = { itemId: item.itemId, stem: item.stem, correctOption, correctExplanation };
  const taxonomy: QuestionTaxonomyMetadata = {
    area: item.taxonomy.area,
    competency: item.taxonomy.competency,
    topic: `${item.taxonomy.area} - ${item.taxonomy.competency}`,
  };
  const pedagogical: QuestionPedagogicalMetadata = {
    cognitiveIntent: "Analizar el caso contra la competencia y seleccionar la mejor alternativa.",
    expectedUserTask: "Comparar alternativas y justificar la más consistente con la competencia.",
  };
  const editorial: QuestionEditorialMetadata = { sourceType: item.sourceType, sourceRefs: item.sourceRefs };
  const risk: QuestionRiskMetadata = { sourceTruthStatus: item.sourceTruthStatus };

  return {
    ...core,
    ...taxonomy,
    ...pedagogical,
    sourceType: editorial.sourceType,
    sourceRefs: editorial.sourceRefs,
    options,
    sourceTruthStatus: risk.sourceTruthStatus,
  };
}

export function questionTruthToTutorSupportContract(question: QuestionTruth): TutorSupportContract {
  const instructional: TutorInstructionalContract = {
    instructionalGoal: `Fortalecer ${question.competency} sin revelar la clave antes de la respuesta.`,
    canonicalRationale: question.correctExplanation,
  };
  const hints: TutorHintContract = {
    hintLadder: [
      { level: 1, hint: `Identifica la tarea esperada: ${question.expectedUserTask}` },
      { level: 2, hint: "Contrasta cada opción con la competencia declarada." },
      { level: 3, hint: "Justifica tu elección con evidencia del enunciado." },
    ],
  };
  const misconception: TutorMisconceptionContract = {
    misconceptionMap: [{ misconception: "Elegir por intuición", safeRedirect: "Vuelve al criterio de la competencia." }],
  };
  const risk: TutorRiskContract = { qualityFlags: ["semantic_governance_v1", "backward_compatible"] };
  const source: TutorSourceTruthContract = {
    sourceTruthRefs: question.sourceRefs,
    normativeReasoning: question.normativeAlignmentSummary ?? "Apoyo con evidencia disponible sin inventar fuente.",
  };

  return { ...instructional, ...hints, ...misconception, ...risk, ...source };
}
