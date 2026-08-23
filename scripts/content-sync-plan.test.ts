import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContentSyncPlan,
  calculateContentSyncPlanHash,
  isApprovedItemMapping,
  isApprovedKnowledgeTarget,
  isVerifiedKnowledgeSource,
  isVerifiedOpec,
  summarizeContentSyncPlan,
} from "./lib/content-sync-plan";

test("canonical repository builds a deterministic complete clean V4 sync plan", async () => {
  const first = await buildContentSyncPlan(process.cwd());
  const second = await buildContentSyncPlan(process.cwd());
  assert.deepEqual(first, second);
  const summary = summarizeContentSyncPlan(first);
  assert.equal(summary.counts.questions, 248);
  assert.equal(summary.counts.families, 1);
  assert.equal(summary.counts.profiles, 6);
  assert.equal(summary.counts.opecs, 0);
  assert.equal(summary.counts.itemTargets, 0);
  assert.equal(summary.counts.knowledgeSources, 0);
  assert.equal(first.entityIds.questions.length, 248);
  assert.equal(calculateContentSyncPlanHash(first), summary.planHash);
});

test("unverified catalogs and unapproved mappings never enter a sync plan", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  assert.equal(plan.entities.opecs.every((opec) => opec.verificationStatus !== "needs_review"), true);
  assert.equal(plan.entities.knowledgeSources.every((source) => Boolean(source.verifiedAt)), true);
  assert.equal(plan.entities.itemTargets.length, 0);
  assert.equal(plan.entities.knowledgeTargets.length, 0);
  assert.equal(plan.entities.itemSources.length, 0);

  assert.equal(isVerifiedOpec({ verificationStatus: "needs_review" }), false);
  assert.equal(isApprovedItemMapping({ reviewStatus: "candidate" }), false);
  assert.equal(isVerifiedKnowledgeSource({ verificationStatus: "verified" }), false);
  assert.equal(isVerifiedKnowledgeSource({ verificationStatus: "needs_review", verifiedAt: "2026-08-23T00:00:00Z" }), false);
  assert.equal(isApprovedKnowledgeTarget({ status: "candidate", verifiedAt: "x", verifiedBy: "x", sourceId: "S" }, new Set(["S"])), false);
  assert.equal(isApprovedKnowledgeTarget({ status: "active", verifiedAt: "x", verifiedBy: "x", sourceId: "UNKNOWN" }, new Set(["S"])), false);
});

test("changing an effective plan changes its approval hash", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  const changed = structuredClone(plan);
  changed.entities.questions[0].stem += " altered";
  changed.entities.questions[0].contentHash = "0".repeat(64);
  assert.notEqual(calculateContentSyncPlanHash(changed), calculateContentSyncPlanHash(plan));
});
