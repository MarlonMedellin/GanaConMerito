import assert from "node:assert/strict";
import test from "node:test";
import { buildPracticeQuestionViewModel } from "./practice-question";

test("pre-answer practice payload excludes answer-bearing fields", () => {
  const payload = buildPracticeQuestionViewModel(
    {
      id: "item-1",
      title: "Pregunta",
      area: "pedagogia",
      subarea: "planeacion",
      competency: "decision_pedagogica",
      difficulty: 0.5,
      stem: "Enunciado",
      source_type: "official_source",
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
  assert.doesNotMatch(serialized, /correct_option|correctOption|explanation|editorial_metadata/i);
});
