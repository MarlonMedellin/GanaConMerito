import test from "node:test";
import assert from "node:assert";
import { TutorOrchestrator } from "./tutor-orchestrator";
import { selectAnsweredTurnForItem } from "./tutor-evidence-builder";
import type { TutorEvidence, TutorTurnRequest } from "../../types/tutor-turn";

import { normalizeLegacyItemToRichItem } from "../../domain/taxonomy/normalize-item";
import { normalizeTaxonomyValue, validateTagRegistry } from "../../domain/taxonomy/validators";
import { questionTruthToTutorSupportContract, richItemToQuestionTruth } from "../../domain/tutor/question-truth-adapter";

const baseEvidence: TutorEvidence = {
  contest: {
    contestId: "contest-1",
    contestName: "Concurso docente",
    agreementId: "agreement-1",
    methodologicalGuideId: "guide-1",
    testStructureId: "structure-1",
    evaluationStructureSummary: "Estructura cargada.",
    evaluationRulesSummary: "El tutor no modifica puntaje ni avance.",
    sourceTruthVersion: "test-v1",
  },
  aspirationalProfile: {
    profileId: "profile-1",
    contestId: "contest-1",
    jobName: "Docente General",
    hierarchicalLevel: "Docente",
    performanceArea: "educacion",
    purposeSummary: "Propósito cargado.",
    functionSummary: "Funciones cargadas.",
    functionalCompetencySummary: "Competencias funcionales cargadas.",
    behavioralCompetencySummary: "Competencias comportamentales cargadas.",
    mipgAlignmentSummary: "MIPG cargado.",
  },
  question: {
    itemId: "item-1",
    area: "pedagogia",
    competency: "evaluacion",
    topic: "pedagogia - evaluacion",
    cognitiveIntent: "Contrastar opciones.",
    expectedUserTask: "Seleccionar la opción más consistente.",
    sourceType: "test",
    sourceRefs: ["item_bank:item-1"],
    stem: "Caso de evaluación formativa.",
    options: [
      { key: "A", text: "Opción A" },
      { key: "B", text: "Opción B" },
      { key: "C", text: "Opción C" },
      { key: "D", text: "Opción D" },
    ],
    correctOption: "B",
    correctExplanation: "B responde mejor al propósito formativo.",
  },
  userSession: {
    sessionId: "session-1",
    userId: "user-1",
    selectedContestId: "contest-1",
    selectedProfileId: "profile-1",
    currentItemId: "item-1",
    recentPerformanceSummary: "Últimos 2 intentos: 1 correcto.",
  },
};

function makeInput(message: string, evidence: TutorEvidence = baseEvidence): TutorTurnRequest {
  return {
    userId: "user-1",
    sessionId: "session-1",
    itemId: "item-1",
    message,
    evidence,
  };
}

test("TutorOrchestrator denies correct answer before user answers", async () => {
  const result = await new TutorOrchestrator().processTurn(makeInput("Dime la respuesta correcta"));

  assert.strictEqual(result.output.degraded, false);
  assert.strictEqual(result.output.canRevealCorrectAnswer, false);
  assert.match(result.output.visibleMessage, /no puedo revelar/i);
  assert.ok(result.output.guardrailsApplied.includes("no_correct_answer_before_user_answer"));
  assert.strictEqual(result.output.traceSignals?.responseModeUsed, "pre_answer");
  assert.strictEqual(result.output.traceSignals?.dossierAvailable, true);
});

test("TutorOrchestrator gives hint without revealing correct answer", async () => {
  const result = await new TutorOrchestrator().processTurn(makeInput("Dame una pista"));

  assert.strictEqual(result.output.intent, "give_hint");
  assert.strictEqual(result.output.canRevealCorrectAnswer, false);
  assert.doesNotMatch(result.output.visibleMessage, /correcta registrada es B|clave registrada es B/i);
});

test("TutorOrchestrator degrades on insufficient source truth", async () => {
  const result = await new TutorOrchestrator().processTurn(
    makeInput("Explícame esta pregunta", {
      userSession: baseEvidence.userSession,
    }),
  );

  assert.strictEqual(result.output.degraded, true);
  assert.match(result.output.visibleMessage, /No tengo evidencia suficiente/i);
});

test("TutorOrchestrator can explain correct option after user answers", async () => {
  const result = await new TutorOrchestrator().processTurn(
    makeInput("Explícame el feedback", {
      ...baseEvidence,
      userSession: {
        ...baseEvidence.userSession,
        selectedOption: "A",
        feedback: "Respuesta enviada.",
      },
    }),
  );

  assert.strictEqual(result.output.canRevealCorrectAnswer, true);
  assert.match(result.output.visibleMessage, /opción correcta registrada es B/i);
  assert.match(result.output.visibleMessage, /feedback oficial registrado/i);
  assert.match(result.output.visibleMessage, /distractores/i);
  assert.strictEqual(result.trace.canRevealCorrectAnswer, true);
});

test("TutorOrchestrator classifies user rationale without scoring", async () => {
  const result = await new TutorOrchestrator().processTurn(
    makeInput("Analiza mi justificación", {
      ...baseEvidence,
      userSession: {
        ...baseEvidence.userSession,
        selectedOption: "B",
        userRationale:
          "Elijo esta porque responde al propósito formativo del caso y descarta una acción sancionatoria. En cambio, las otras opciones no conectan la evaluación con mejora del aprendizaje ni seguimiento pedagógico.",
      },
    }),
  );

  assert.strictEqual(result.output.rationaleQuality, "strong");
  assert.match(result.output.visibleMessage, /no cambia el puntaje oficial/i);
  assert.match(result.output.visibleMessage, /distractores/i);
  assert.ok(result.output.guardrailsApplied.includes("no_score_mutation"));
});

test("TutorOrchestrator keeps blocking correct answer without answered evidence", async () => {
  const result = await new TutorOrchestrator().processTurn(makeInput("Cuál era la correcta"));

  assert.strictEqual(result.output.canRevealCorrectAnswer, false);
  assert.doesNotMatch(result.output.visibleMessage, /clave registrada es B|opción correcta registrada es B/i);
});

test("TutorOrchestrator maps post-answer feedback phrasing to explain_feedback intent", async () => {
  const result = await new TutorOrchestrator().processTurn(
    makeInput("Por qué mi respuesta está bien o mal", {
      ...baseEvidence,
      userSession: {
        ...baseEvidence.userSession,
        selectedOption: "A",
        feedback: "La elección no atendió el criterio principal.",
      },
    }),
  );

  assert.strictEqual(result.output.intent, "explain_feedback");
  assert.strictEqual(result.output.canRevealCorrectAnswer, true);
  assert.match(result.output.visibleMessage, /puntaje oficial/i);
});



test("TutorOrchestrator keeps guided actions compatible with current intent detection", async () => {
  const hint = await new TutorOrchestrator().processTurn(makeInput("Dame una pista"));
  assert.strictEqual(hint.output.intent, "give_hint");
  assert.strictEqual(hint.output.canRevealCorrectAnswer, false);

  const rationale = await new TutorOrchestrator().processTurn(makeInput("Analiza mi justificación"));
  assert.strictEqual(rationale.output.intent, "analyze_user_rationale");

  const feedback = await new TutorOrchestrator().processTurn(
    makeInput("Explícame el feedback", {
      ...baseEvidence,
      userSession: {
        ...baseEvidence.userSession,
        selectedOption: "A",
        feedback: "La elección no atendió el criterio principal.",
      },
    }),
  );

  assert.strictEqual(feedback.output.intent, "explain_feedback");
  assert.strictEqual(feedback.output.canRevealCorrectAnswer, true);
});

test("selectAnsweredTurnForItem chooses the matching answered turn for the item", () => {
  const turn = selectAnsweredTurnForItem(
    [
      {
        id: "turn-3",
        item_id: "item-2",
        selected_option: "C",
        user_rationale: null,
        model_feedback: "Otro turno",
        created_at: "2026-01-03T00:00:00.000Z",
      },
      {
        id: "turn-2",
        item_id: "item-1",
        selected_option: "A",
        user_rationale: "Porque descarto distractores",
        model_feedback: "Feedback correcto",
        created_at: "2026-01-02T00:00:00.000Z",
        is_correct: false,
        competency_score: 60,
      },
      {
        id: "turn-1",
        item_id: "item-1",
        selected_option: null,
        user_rationale: null,
        model_feedback: null,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    "item-1",
  );

  assert.strictEqual(turn?.id, "turn-2");
  assert.strictEqual(turn?.selected_option, "A");
});

test("selectAnsweredTurnForItem ignores a newer unanswered turn for the same item", () => {
  const turn = selectAnsweredTurnForItem(
    [
      {
        id: "turn-3",
        item_id: "item-1",
        selected_option: null,
        user_rationale: null,
        model_feedback: null,
        created_at: "2026-01-03T00:00:00.000Z",
      },
      {
        id: "turn-2",
        item_id: "item-1",
        selected_option: "B",
        user_rationale: "Descarto distractores",
        model_feedback: "Feedback oficial",
        created_at: "2026-01-02T00:00:00.000Z",
        is_correct: true,
        competency_score: 90,
      },
    ],
    "item-1",
  );

  assert.strictEqual(turn?.id, "turn-2");
  assert.strictEqual(turn?.selected_option, "B");
});


test("TutorOrchestrator enforces no-reveal sanitization in pre-answer mode", async () => {
  const result = await new TutorOrchestrator().processTurn(makeInput("Compara opciones"));
  assert.strictEqual(result.output.canRevealCorrectAnswer, false);
  assert.doesNotMatch(result.output.visibleMessage, /la correcta es\s+[A-D]|elige\s+[A-D]/i);
  assert.strictEqual(result.output.traceSignals?.guardrailTriggered, true);
});

test("semantic governance rejects unknown tags", () => {
  assert.throws(() => validateTagRegistry({ content_topic: ["invented_tag"] }), /Unknown tag/i);
});

test("semantic governance rejects invalid targetPosition", () => {
  assert.throws(() => normalizeTaxonomyValue("targetPosition", "astronauta"), /Unknown taxonomy value/i);
});

test("semantic governance normalizes known aliases", () => {
  assert.strictEqual(normalizeTaxonomyValue("dificultad", "fácil"), "baja");
});

test("semantic governance validates area and competency through normalization", () => {
  const item = normalizeLegacyItemToRichItem({
    id: "item-sem-1",
    area: "pedagogía",
    competency: "analisis_pedagogico",
    stem: "Caso",
  });
  assert.strictEqual(item.taxonomy.area, "pedagogia");
  assert.strictEqual(item.taxonomy.competency, "analisis_pedagogico");
});

test("legacy compatibility flow builds QuestionTruth and TutorSupportContract", () => {
  const rich = normalizeLegacyItemToRichItem({
    id: "item-sem-2",
    area: "pedagogia",
    competency: "evaluacion_formativa",
    stem: "Caso de aula",
  });
  const truth = richItemToQuestionTruth(
    rich,
    [
      { key: "A", text: "A" },
      { key: "B", text: "B" },
    ],
    "B",
    "Rationale",
  );
  const support = questionTruthToTutorSupportContract(truth);

  assert.strictEqual(truth.itemId, "item-sem-2");
  assert.strictEqual(truth.competency, "evaluacion_formativa");
  assert.ok(support.instructionalGoal);
  assert.ok(support.qualityFlags?.includes("backward_compatible"));
});
