import assert from "node:assert/strict";
import test from "node:test";
import { buildPracticeQuestionViewModel } from "./practice-question";

test("pre-answer practice payload excludes answer-bearing fields", () => {
  const payload = buildPracticeQuestionViewModel(
    {
      id: "item-1",
      title: "Pregunta",
      area: "pedagogia",
      topic: "planeacion",
      competency: "decision_pedagogica",
      difficulty: 0.5,
      context: "Una docente debe decidir cómo ajustar su planeación.",
      stem: "Enunciado",
      questionType: "case_analysis",
      cognitiveLevel: "aplicar",
      sourceReference: "Decreto 1075 de 2015",
      sourceType: "official_source",
      tags: ["v4"],
      correct_option: "A",
      explanation: "A es la respuesta correcta",
      editorial_metadata: { explanations: { A: "correcta" } },
    } as never,
    [
      { key: "A", text: "Opción A" },
      { key: "B", text: "Opción B" },
      { key: "C", text: "Opción C" },
      { key: "D", text: "Opción D" },
    ],
  );

  const serialized = JSON.stringify(payload);
  assert.equal("rationale" in payload, false);
  assert.equal(payload.context, "Una docente debe decidir cómo ajustar su planeación.");
  assert.equal(payload.questionType, "case_analysis");
  assert.equal(payload.cognitiveLevel, "aplicar");
  assert.doesNotMatch(serialized, /correct_option|correctOption|explanation|editorial_metadata/i);
});
