import assert from "node:assert/strict";
import fs from "node:fs/promises";
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

interface KnowledgeInventorySource {
  sourceId: string;
  verificationStatus: string;
  verifiedAt: string | null;
  url?: string | null;
  repoPath?: string | null;
  verificationScope?: string | null;
}

async function readKnowledgeInventory() {
  return JSON.parse(await fs.readFile("content/knowledge-base/catalog/source-inventory.json", "utf8")) as {
    sources: KnowledgeInventorySource[];
  };
}

test("canonical repository builds a deterministic complete clean V4 sync plan", async () => {
  const first = await buildContentSyncPlan(process.cwd());
  const second = await buildContentSyncPlan(process.cwd());
  assert.deepEqual(first, second);
  const inventory = await readKnowledgeInventory();
  const expectedKnowledgeSourceIds = inventory.sources
    .filter(isVerifiedKnowledgeSource)
    .map((source) => source.sourceId)
    .sort();
  const plannedKnowledgeSourceIds = first.entities.knowledgeSources
    .map((source) => String(source.sourceId))
    .sort();
  const summary = summarizeContentSyncPlan(first);
  assert.equal(summary.counts.questions, 248);
  assert.equal(summary.counts.families, 1);
  assert.equal(summary.counts.profiles, 6);
  assert.equal(summary.counts.opecs, 0);
  assert.equal(summary.counts.itemTargets, 0);
  assert.equal(summary.counts.knowledgeSources, expectedKnowledgeSourceIds.length);
  assert.deepEqual(plannedKnowledgeSourceIds, expectedKnowledgeSourceIds);
  assert.deepEqual(expectedKnowledgeSourceIds, [
    "cnsc-docentes-2026-proyecto-acuerdo-antioquia",
    "cnsc-docentes-2026-proyecto-anexo-tecnico",
  ]);
  assert.equal(first.entityIds.questions.length, 248);
  assert.equal(calculateContentSyncPlanHash(first), summary.planHash);
});

test("unverified catalogs and unapproved mappings never enter a sync plan", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  const inventory = await readKnowledgeInventory();
  const plannedKnowledgeSourceIds = new Set(plan.entities.knowledgeSources.map((source) => String(source.sourceId)));
  const needsReviewSourceIds = inventory.sources
    .filter((source) => source.verificationStatus === "needs_review")
    .map((source) => source.sourceId);
  const cnscSourceIds = [
    "cnsc-docentes-2026-proyecto-acuerdo-antioquia",
    "cnsc-docentes-2026-proyecto-anexo-tecnico",
  ];

  assert.equal(plan.entities.opecs.every((opec) => opec.verificationStatus !== "needs_review"), true);
  assert.equal(plan.entities.knowledgeSources.every((source) => Boolean(source.verifiedAt)), true);
  assert.equal(plan.entities.itemTargets.length, 0);
  assert.equal(plan.entities.knowledgeTargets.length, 0);
  assert.equal(plan.entities.itemSources.length, 0);
  assert.ok(needsReviewSourceIds.length > 0);
  assert.equal(needsReviewSourceIds.some((sourceId) => plannedKnowledgeSourceIds.has(sourceId)), false);
  for (const sourceId of cnscSourceIds) {
    const source = inventory.sources.find((candidate) => candidate.sourceId === sourceId);
    assert.ok(source, `Missing canonical CNSC source ${sourceId}`);
    assert.equal(source.verificationStatus, "verified");
    assert.ok(source.verifiedAt);
    assert.ok(source.url);
    assert.ok(source.repoPath);
    assert.ok(source.verificationScope);
    assert.equal(plannedKnowledgeSourceIds.has(sourceId), true);
  }

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
