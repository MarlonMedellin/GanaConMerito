import test from "node:test";
import assert from "node:assert/strict";
import { mapItemRecordToQuestionTruth } from "./tutor-evidence-builder";

test("Sprint 40 maps rich item metadata into QuestionTruth", () => {
  const question = mapItemRecordToQuestionTruth({
    item: {
      id: "item-rich",
      area: "pedagogia",
      subarea: "didactica",
      competency: "analisis",
      stem: "Caso",
      correct_option: "C",
      explanation: "Clave",
      source_type: "runtime_item_bank",
      source_path: "content/items/pedagogia/didactica/analisis/item-rich.json",
      tipo_item: "seleccion_multiple",
      nivel_educativo: "media",
      afirmacion: "La evaluación es formativa",
      evidencia: "Se contrasta evidencia y decisión",
      nivel_cognitivo: "analisis",
      dificultad: "media",
      contexto: "Institución rural",
      justificacion_distractores: { A: "Generaliza", B: "Descontextualiza" },
      riesgos_tecnicos: ["possible_double_key"],
      estado: "approved",
      version: "1.0.0",
      target_role: "docente",
      target_position: "docente_aula",
      applicant_profile: "perfil_base",
      tags: ["formativa"],
    },
    options: [{ option_key: "A", option_text: "A" }, { option_key: "C", option_text: "C" }],
    selectedOption: "A",
  });

  assert.equal(question.subarea, "didactica");
  assert.equal(question.difficulty, "media");
  assert.equal(question.cognitiveLevel, "analisis");
  assert.deepEqual(question.distractorRationales, { A: "Generaliza", B: "Descontextualiza" });
  assert.deepEqual(question.technicalRisks, ["possible_double_key"]);
});

test("Sprint 40 preserves legacy fallback when rich fields are absent", () => {
  const question = mapItemRecordToQuestionTruth({
    item: {
      id: "item-legacy",
      area: null,
      subarea: null,
      competency: null,
      stem: null,
      correct_option: null,
      explanation: null,
      source_type: null,
      source_path: null,
      tipo_item: null,
      nivel_educativo: null,
      afirmacion: null,
      evidencia: null,
      nivel_cognitivo: null,
      dificultad: null,
      contexto: null,
      justificacion_distractores: null,
      riesgos_tecnicos: null,
      estado: null,
      version: null,
      target_role: null,
      target_position: null,
      applicant_profile: null,
      tags: null,
    },
    options: [{ option_key: "A", option_text: "A" }],
  });

  assert.equal(question.area, "general");
  assert.equal(question.competency, "competencia no especificada");
  assert.equal(question.correctOption, "");
  assert.equal(question.distractorRationales, undefined);
  assert.equal(question.technicalRisks, undefined);
});
