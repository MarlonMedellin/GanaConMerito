import assert from "node:assert/strict";
import test from "node:test";
import { TUTOR_CONTRACT_VERSION } from "../../domain/tutor/contract";
import {
  NORMATIVE_SOURCE_TRUTH_VERSION,
  SYNTHETIC_NORMATIVE_SOURCE_STATUS,
  buildAspirationalProfileTruthV1,
  buildContestTruthV1,
  buildTutorSupportContract,
  enrichQuestionTruthWithNormativeSource,
  getNormativeSourceTruthRefs,
} from "./normative-source-truth";

test("Sprint 22 keeps contest truth in synthesized governed unverified mode", () => {
  const contest = buildContestTruthV1();
  const refs = getNormativeSourceTruthRefs();

  assert.equal(NORMATIVE_SOURCE_TRUTH_VERSION, `${TUTOR_CONTRACT_VERSION}:normative-synth-v1`);
  assert.equal(contest.sourceTruthVersion, NORMATIVE_SOURCE_TRUTH_VERSION);
  assert.equal(contest.sourceTruthStatus, SYNTHETIC_NORMATIVE_SOURCE_STATUS);
  assert.equal(contest.sourceTruthStatus, "synthesized_governed_unverified");
  assert.equal(contest.agreementId, "agreement-source-pending");
  assert.equal(contest.methodologicalGuideId, "methodological-guide-source-pending");
  assert.equal(contest.testStructureId, "test-structure-source-pending");
  assert.deepEqual(contest.sourceTruthRefs, refs);
  assert.match(contest.insufficientSourceReason ?? "", /guía metodológica|guia metodológica/i);
  assert.match(contest.evaluationRulesSummary, /no modifica puntaje/i);
});

test("Sprint 22 propagates normative guardrails into aspirational profile truth", () => {
  const profile = buildAspirationalProfileTruthV1({
    id: "profile-1",
    name: "Docente General",
    description: "Perfil seleccionado para práctica guiada.",
    area: "educacion",
  });

  assert.ok(profile);
  assert.equal(profile?.sourceTruthStatus, SYNTHETIC_NORMATIVE_SOURCE_STATUS);
  assert.deepEqual(profile?.sourceTruthRefs, getNormativeSourceTruthRefs());
  assert.match(profile?.behavioralCompetencySummary ?? "", /no presenta esta síntesis como transcripción oficial/i);
});

test("Sprint 22 enriches question truth without duplicating refs and preserves explicit status", () => {
  const enriched = enrichQuestionTruthWithNormativeSource({
    itemId: "item-1",
    area: "pedagogia",
    competency: "evaluacion",
    topic: "pedagogia - evaluacion",
    cognitiveIntent: "Contrastar opciones",
    expectedUserTask: "Elegir la mejor opción",
    sourceType: "runtime_item_bank",
    sourceRefs: ["runtime:item_bank", "custom:question-1"],
    stem: "Caso de práctica",
    options: [
      { key: "A", text: "A" },
      { key: "B", text: "B" },
    ],
    correctOption: "B",
    correctExplanation: "B responde mejor al caso.",
    sourceTruthStatus: "source_verified",
  });

  assert.equal(enriched.sourceTruthStatus, "source_verified");
  assert.equal(enriched.userExpectedAnswer, "Elegir la mejor opción");
  assert.match(enriched.normativeAlignmentSummary ?? "", /alineación normativa fina debe validarse/i);
  assert.deepEqual(enriched.sourceRefs, [
    "runtime:item_bank",
    "custom:question-1",
    "docs/01-product/source-truth/normative-source-truth-v1.md",
    "runtime:professional_profiles",
  ]);
});

test("Sprint 22 returns undefined aspirational truth when no profile is available", () => {
  assert.equal(buildAspirationalProfileTruthV1(null), undefined);
});

test("Sprint 40 builds tutor support contract with rich metadata", () => {
  const enriched = buildTutorSupportContract({
    itemId: "item-rich-1",
    area: "pedagogia",
    subarea: "evaluacion_formativa",
    competency: "analisis",
    topic: "pedagogia - evaluacion_formativa - analisis",
    cognitiveIntent: "Analizar",
    expectedUserTask: "Elegir la mejor opción",
    sourceType: "runtime_item_bank",
    sourceRefs: ["runtime:item_bank"],
    stem: "Caso",
    options: [{ key: "A", text: "A" }],
    correctOption: "A",
    correctExplanation: "Porque A",
    evidenceStatement: "La evidencia exige contraste de alternativas.",
    difficulty: "media",
    cognitiveLevel: "analisis",
    context: "Aula multigrado",
    distractorRationales: { B: "Confunde evaluación con sanción" },
    technicalRisks: ["possible_double_key"],
    targetPosition: "docente_aula",
    applicantProfile: "perfil_docente_basico",
  });

  assert.ok(enriched);
  assert.match(enriched?.instructionalGoal ?? "", /evaluacion_formativa/i);
  assert.match(enriched?.normativeReasoning ?? "", /evidencia exige contraste/i);
  assert.ok(enriched?.qualityFlags?.includes("technical_risk_caution"));
  assert.ok(enriched?.qualityFlags?.includes("distractor_rationales_available"));
});
