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

interface OpecCatalogRecord {
  sourceSystem: string;
  externalOpecId: string;
  familyCode: string;
  profileCode: string;
  positionName: string;
  status: string;
  verificationStatus: string;
  metadata?: Record<string, unknown>;
}

interface ItemMappingRecord {
  itemId: string;
  targets: Array<Record<string, unknown>>;
  reviewStatus: string;
  evidence: string[];
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

async function readKnowledgeInventory() {
  return JSON.parse(await fs.readFile("content/knowledge-base/catalog/source-inventory.json", "utf8")) as {
    sources: KnowledgeInventorySource[];
  };
}

async function readOpecCatalog() {
  return JSON.parse(await fs.readFile("content/targeting/opecs/catalog.json", "utf8")) as {
    opecs: OpecCatalogRecord[];
  };
}

async function readItemTargetMap() {
  return JSON.parse(await fs.readFile("content/targeting/item-maps/question-bank-v4.json", "utf8")) as {
    mappings: ItemMappingRecord[];
  };
}

test("canonical repository builds a deterministic complete clean V4 sync plan", async () => {
  const first = await buildContentSyncPlan(process.cwd());
  const second = await buildContentSyncPlan(process.cwd());
  assert.deepEqual(first, second);

  const [inventory, opecCatalog, itemMap] = await Promise.all([
    readKnowledgeInventory(),
    readOpecCatalog(),
    readItemTargetMap(),
  ]);

  const expectedKnowledgeSourceIds = inventory.sources
    .filter(isVerifiedKnowledgeSource)
    .map((source) => source.sourceId)
    .sort();
  const plannedKnowledgeSourceIds = first.entities.knowledgeSources
    .map((source) => String(source.sourceId))
    .sort();
  const expectedOpecIds = opecCatalog.opecs
    .filter(isVerifiedOpec)
    .map((opec) => `${opec.sourceSystem}:${opec.externalOpecId}`)
    .sort();
  const plannedOpecIds = first.entityIds.opecs.slice().sort();
  const approvedMappings = itemMap.mappings.filter(isApprovedItemMapping);
  const expectedItemTargetCount = approvedMappings.reduce((total, mapping) => total + mapping.targets.length, 0);
  const summary = summarizeContentSyncPlan(first);

  assert.equal(summary.counts.questions, 248);
  assert.equal(summary.counts.families, 1);
  assert.equal(summary.counts.profiles, 6);
  assert.equal(summary.counts.opecs, expectedOpecIds.length);
  assert.equal(summary.counts.itemTargets, expectedItemTargetCount);
  assert.deepEqual(plannedOpecIds, expectedOpecIds);
  assert.equal(summary.counts.knowledgeSources, expectedKnowledgeSourceIds.length);
  assert.deepEqual(plannedKnowledgeSourceIds, expectedKnowledgeSourceIds);
  assert.deepEqual(expectedKnowledgeSourceIds, [
    "cnsc-docentes-2026-proyecto-acuerdo-antioquia",
    "cnsc-docentes-2026-proyecto-anexo-tecnico",
  ]);
  assert.equal(first.entityIds.questions.length, 248);
  assert.equal(calculateContentSyncPlanHash(first), summary.planHash);
});

test("CAN-001 synthetic OPEC is explicit, non-authoritative, and replaceable", async () => {
  const catalog = await readOpecCatalog();
  const synthetic = catalog.opecs.find((opec) => opec.metadata?.purpose === "CAN-001 Canary bootstrap");

  assert.ok(synthetic, "CAN-001 synthetic Canary OPEC must be present while the real SIMO identifier is unavailable");
  assert.equal(synthetic.sourceSystem, "GCM_CANARY_SYNTHETIC");
  assert.match(synthetic.externalOpecId, /^CAN001-/);
  assert.notEqual(synthetic.sourceSystem, "SIMO");
  assert.equal(synthetic.familyCode, "docentes");
  assert.equal(synthetic.profileCode, "docente_aula_secundaria_media");
  assert.equal(synthetic.positionName, "Docente de aula matemáticas");
  assert.equal(synthetic.status, "active");
  assert.equal(synthetic.verificationStatus, "verified");
  assert.equal(synthetic.metadata?.synthetic, true);
  assert.equal(synthetic.metadata?.authoritative, false);
  assert.equal(synthetic.metadata?.provisional, true);
  assert.equal(synthetic.metadata?.replacementRequired, true);
  assert.equal(synthetic.metadata?.intendedSourceSystem, "SIMO");
  assert.equal(synthetic.metadata?.realExternalOpecId, null);
});

test("CAN-001 minimum inventory keeps five approved items at docentes family level", async () => {
  const itemMap = await readItemTargetMap();
  const minimumCanaryIds = ["DOC-001001", "DOC-001002", "DOC-001003", "DOC-001004", "DOC-001005"];

  for (const itemId of minimumCanaryIds) {
    const mapping = itemMap.mappings.find((candidate) => candidate.itemId === itemId);
    assert.ok(mapping, `Missing CAN-001 mapping for ${itemId}`);
    assert.equal(mapping.reviewStatus, "approved");
    assert.deepEqual(mapping.targets, [{ type: "family", familyCode: "docentes" }]);
    assert.ok(mapping.evidence.length > 0);
    assert.ok(mapping.reviewedBy);
    assert.ok(mapping.reviewedAt);
  }
});

test("unverified catalogs and unapproved mappings never enter a sync plan", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  const [inventory, itemMap] = await Promise.all([readKnowledgeInventory(), readItemTargetMap()]);
  const plannedKnowledgeSourceIds = new Set(plan.entities.knowledgeSources.map((source) => String(source.sourceId)));
  const needsReviewSourceIds = inventory.sources
    .filter((source) => source.verificationStatus === "needs_review")
    .map((source) => source.sourceId);
  const approvedMappingIds = new Set(itemMap.mappings.filter(isApprovedItemMapping).map((mapping) => mapping.itemId));
  const cnscSourceIds = [
    "cnsc-docentes-2026-proyecto-acuerdo-antioquia",
    "cnsc-docentes-2026-proyecto-anexo-tecnico",
  ];

  assert.equal(plan.entities.knowledgeSources.every((source) => Boolean(source.verifiedAt)), true);
  assert.equal(plan.entities.itemTargets.every((target) => approvedMappingIds.has(String(target.questionId))), true);
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
