import assert from "node:assert/strict";
import test from "node:test";
import { TUTOR_CONTRACT_VERSION } from "../../domain/tutor/contract";
import { buildTutorTraceSummary } from "./tutor-trace-summary";

test("buildTutorTraceSummary aggregates calibration metrics and top lists", () => {
  const summary = buildTutorTraceSummary([
    {
      created_at: "2026-05-01T12:00:00.000Z",
      mode: "practice",
      intent: "give_hint",
      degraded: false,
      can_reveal_correct_answer: false,
      guardrails_applied: ["no_free_chat"],
      trace_signals: { misconceptionDetected: false, hintLevelUsed: 1, signalStrength: "insufficient" },
    },
    {
      created_at: "2026-05-02T12:00:00.000Z",
      mode: "practice",
      intent: "explain_feedback",
      degraded: true,
      can_reveal_correct_answer: true,
      guardrails_applied: ["degrade_on_missing_evidence"],
      trace_signals: { misconceptionDetected: true, recommendedNextPractice: "x", recommendationEvidenceCount: 1, signalStrength: "weak", likelyFalsePositive: true },
    },
    {
      created_at: "2026-05-03T12:00:00.000Z",
      mode: "practice",
      intent: "give_hint",
      degraded: false,
      can_reveal_correct_answer: false,
      guardrails_applied: ["no_free_chat", "no_score_mutation"],
      trace_signals: { misconceptionDetected: true, hintLevelUsed: 2, weakSubareaSignal: "y", difficultyMismatch: "z", repeatedErrorPattern: "r", recommendedNextPractice: "y", recommendationEvidenceCount: 3, signalStrength: "strong" },
    },
  ]);

  assert.equal(summary.totalTurns, 3);
  assert.equal(summary.degradedTurns, 1);
  assert.equal(summary.signalLevel, "emerging_signal");
  assert.equal(summary.misconceptionRate, 0.667);
  assert.equal(summary.preAnswerGuardrailHits, 2);
  assert.equal(summary.postAnswerExplanations, 1);
  assert.equal(summary.misconceptionSignals, 2);
  assert.equal(summary.sessionsWithoutUsefulEvidence, 1);
  assert.equal(summary.likelyFalsePositives, 1);
  assert.equal(summary.recommendationCoverageRate, 0.667);
  assert.equal(summary.recommendationEvidenceSufficiencyRate, 0.5);
  assert.deepEqual(summary.hintLevelDistribution, [
    { level: 1, count: 1 },
    { level: 2, count: 1 },
  ]);
  assert.deepEqual(summary.topIntents, [
    { intent: "give_hint", count: 2 },
    { intent: "explain_feedback", count: 1 },
  ]);
  assert.deepEqual(summary.topGuardrails, [
    { guardrail: "no_free_chat", count: 2 },
    { guardrail: "degrade_on_missing_evidence", count: 1 },
    { guardrail: "no_score_mutation", count: 1 },
  ]);
  assert.deepEqual(summary.signalFrequency, [
    { signal: "misconceptionDetected", count: 2 },
    { signal: "recommendedNextPractice", count: 2 },
    { signal: "difficultyMismatch", count: 1 },
    { signal: "likelyFalsePositive", count: 1 },
    { signal: "repeatedErrorPattern", count: 1 },
  ]);
  assert.equal(summary.recentTurns[0]?.createdAt, "2026-05-03T12:00:00.000Z");
});

test("buildTutorTraceSummary ignores metadata tags inside guardrails_applied", () => {
  const summary = buildTutorTraceSummary([
    {
      created_at: "2026-05-04T12:00:00.000Z",
      mode: "practice",
      intent: "give_hint",
      degraded: false,
      can_reveal_correct_answer: false,
      guardrails_applied: [TUTOR_CONTRACT_VERSION, "no_free_chat", "non_guardrail_metadata"],
      trace_signals: {},
    },
  ]);

  assert.deepEqual(summary.topGuardrails, [{ guardrail: "no_free_chat", count: 1 }]);
});

test("buildTutorTraceSummary returns zeros for empty input", () => {
  assert.deepEqual(buildTutorTraceSummary([]), {
    totalTurns: 0,
    degradedTurns: 0,
    signalLevel: "low_signal",
    misconceptionRate: 0,
    preAnswerGuardrailHits: 0,
    postAnswerExplanations: 0,
    misconceptionSignals: 0,
    sessionsWithoutUsefulEvidence: 0,
    likelyFalsePositives: 0,
    recommendationCoverageRate: 0,
    recommendationEvidenceSufficiencyRate: 0,
    strengthDistribution: [],
    signalFrequency: [],
    hintLevelDistribution: [],
    topIntents: [],
    topGuardrails: [],
    recentTurns: [],
  });
});
