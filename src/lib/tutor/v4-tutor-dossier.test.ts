import assert from "node:assert/strict";
import test from "node:test";
import { v4QuestionToQuestionTruth } from "../../domain/tutor/question-truth-adapter";
import { hasAnsweredQuestionEvidence, hasQuestionEvidence } from "../../domain/tutor/contract";
import type { TutorEvidence } from "../../types/tutor-turn";

const practiceQuestion = {
  id: "v4-doc-001",
  area: "pedagogia",
  topic: "evaluacion_formativa",
  competency: "toma_de_decisiones",
  context: "Una docente analiza evidencia de aprendizaje.",
  stem: "¿Cuál acción es más pertinente?",
  questionType: "case_analysis",
  cognitiveLevel: "aplicar",
  scope: "general",
  hint: "Identifica qué acción usa la evidencia para mejorar.",
  sourceType: "official_source",
  sourceId: "col-decreto-1075-sector-educacion",
  sourceReference: "Decreto 1075 de 2015",
  sourcePath: "content/question-bank-v4/items/v4-doc-001.json",
  resolvedSources: [
    {
      sourceId: "col-decreto-1075-sector-educacion",
      reference: "Decreto 1075 de 2015",
      title: "Decreto Único Reglamentario del Sector Educación",
      sourceType: "normative",
      relationType: "decisive",
      sourceTruthStatus: "source_verified" as const,
    },
  ],
  options: [
    { key: "A" as const, text: "Acción A" },
    { key: "B" as const, text: "Acción B" },
    { key: "C" as const, text: "Acción C" },
    { key: "D" as const, text: "Acción D" },
  ],
};

function evidence(question: ReturnType<typeof v4QuestionToQuestionTruth>): TutorEvidence {
  return {
    question,
    userSession: {
      sessionId: "session-1",
      userId: "user-1",
      selectedContestId: "contest-1",
      selectedProfileId: "profile-1",
      currentItemId: question.itemId,
    },
  };
}

test("V4 pre-answer dossier carries context and taxonomy without answer truth", () => {
  const question = v4QuestionToQuestionTruth(practiceQuestion);
  const serialized = JSON.stringify(question);

  assert.equal(question.context, practiceQuestion.context);
  assert.equal(question.questionType, practiceQuestion.questionType);
  assert.equal(question.cognitiveLevel, practiceQuestion.cognitiveLevel);
  assert.equal(question.scope, practiceQuestion.scope);
  assert.equal(question.hint, practiceQuestion.hint);
  assert.equal(question.sourceId, "col-decreto-1075-sector-educacion");
  assert.equal(question.resolvedSources?.[0]?.sourceId, "col-decreto-1075-sector-educacion");
  assert.equal(question.sourceTruthStatus, "source_verified");
  assert.ok(question.sourceRefs.includes("sourceId:col-decreto-1075-sector-educacion"));
  assert.equal(hasQuestionEvidence(evidence(question)), true);
  assert.equal(hasAnsweredQuestionEvidence(evidence(question)), false);
  assert.doesNotMatch(serialized, /correctOption|correctExplanation|learningNote|explanations/);
});

test("V4 post-answer dossier adds governed explanations and learning note", () => {
  const question = v4QuestionToQuestionTruth({
    ...practiceQuestion,
    answered: {
      correctOption: "B",
      explanations: {
        A: "No usa la evidencia para ajustar la enseñanza.",
        B: "Usa la evidencia y adapta la intervención pedagógica.",
        C: "Confunde seguimiento con sanción.",
        D: "Posterga una decisión necesaria.",
      },
      learningNote: "La evaluación formativa orienta decisiones de mejora.",
    },
  });

  assert.equal(question.correctOption, "B");
  assert.equal(question.correctExplanation, "Usa la evidencia y adapta la intervención pedagógica.");
  assert.equal(question.explanations?.A, "No usa la evidencia para ajustar la enseñanza.");
  assert.equal(question.learningNote, "La evaluación formativa orienta decisiones de mejora.");
  assert.equal(hasAnsweredQuestionEvidence(evidence(question)), true);
});
