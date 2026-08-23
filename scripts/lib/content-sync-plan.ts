import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { buildV4ImportPlan, canonicalJson } from "./v4-import-plan";

export const CLEAN_BASELINE_ID = "gcm-v4-clean-v1";

type JsonRecord = Record<string, any>;

export interface ContentSyncPlan {
  baselineId: typeof CLEAN_BASELINE_ID;
  gitSha: string;
  release: {
    bank: string;
    manifestSourceSha: string;
    expectedItemCount: number;
  };
  hashes: {
    manifest: string;
    corpus: string;
    ids: string;
    targeting: string;
    opec: string;
    knowledge: string;
  };
  entities: {
    families: JsonRecord[];
    profiles: JsonRecord[];
    opecs: JsonRecord[];
    questions: JsonRecord[];
    itemTargets: JsonRecord[];
    knowledgeSources: JsonRecord[];
    knowledgeTargets: JsonRecord[];
    itemSources: JsonRecord[];
  };
  entityIds: {
    families: string[];
    profiles: string[];
    opecs: string[];
    questions: string[];
    knowledgeSources: string[];
  };
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hashed<T extends JsonRecord>(record: T): T & { contentHash: string } {
  return { ...record, contentHash: sha256(canonicalJson(record)) };
}

export function entityContentHash(record: JsonRecord) {
  const { contentHash: _ignored, ...content } = record;
  return sha256(canonicalJson(content));
}

async function readJson(file: string) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function jsonFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await jsonFiles(target));
    else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".schema.json")) files.push(target);
  }
  return files.sort();
}

function nonNullEntries(record: JsonRecord) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null && value !== undefined));
}

function difficultyValue(value: string) {
  if (value === "low") return 0.25;
  if (value === "high") return 0.75;
  return 0.5;
}

export function isVerifiedOpec(record: JsonRecord) {
  return record.verificationStatus === "verified";
}

export function isApprovedItemMapping(record: JsonRecord) {
  return record.reviewStatus === "approved";
}

export function isVerifiedKnowledgeSource(record: JsonRecord) {
  return record.verificationStatus === "verified" && Boolean(record.verifiedAt);
}

export function isApprovedKnowledgeTarget(record: JsonRecord, verifiedSourceIds: ReadonlySet<string>) {
  return record.status === "active"
    && Boolean(record.verifiedAt)
    && Boolean(record.verifiedBy)
    && verifiedSourceIds.has(record.sourceId);
}

export function calculateContentSyncPlanHash(plan: ContentSyncPlan) {
  return sha256(canonicalJson(plan));
}

export async function buildContentSyncPlan(repoRoot: string): Promise<ContentSyncPlan> {
  const v4 = await buildV4ImportPlan(repoRoot);
  const manifestPath = path.join(repoRoot, "content/question-bank-v4/MANIFEST.json");
  const familyFiles = await jsonFiles(path.join(repoRoot, "content/targeting/families"));
  const profileFiles = await jsonFiles(path.join(repoRoot, "content/targeting/profiles"));
  const opecPath = path.join(repoRoot, "content/targeting/opecs/catalog.json");
  const itemMapPath = path.join(repoRoot, "content/targeting/item-maps/question-bank-v4.json");
  const knowledgeInventoryPath = path.join(repoRoot, "content/knowledge-base/catalog/source-inventory.json");
  const knowledgeMapFiles = (await jsonFiles(path.join(repoRoot, "content/knowledge-base/maps")))
    .filter((file) => path.basename(file) !== "map.schema.json");

  const [manifestRaw, familyCatalogs, profileCatalogs, opecCatalog, itemMap, knowledgeInventory, knowledgeMaps] = await Promise.all([
    fs.readFile(manifestPath, "utf8"),
    Promise.all(familyFiles.map(readJson)),
    Promise.all(profileFiles.map(readJson)),
    readJson(opecPath),
    readJson(itemMapPath),
    readJson(knowledgeInventoryPath),
    Promise.all(knowledgeMapFiles.map(readJson)),
  ]);

  const gitSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  if (!/^[a-f0-9]{40}$/.test(gitSha)) throw new Error("Current Git SHA is invalid");

  const families = familyCatalogs.map((family) => hashed({
    code: family.code,
    name: family.name,
    description: family.description,
    isActive: family.status === "active",
  })).sort((left, right) => left.code.localeCompare(right.code));

  const profiles = profileCatalogs.flatMap((catalog) => catalog.profiles.map((profile: JsonRecord) => hashed({
    code: profile.code,
    familyCode: catalog.familyCode,
    name: profile.name,
    isActive: profile.status === "active",
  }))).sort((left, right) => left.code.localeCompare(right.code));

  const opecs = opecCatalog.opecs
    .filter(isVerifiedOpec)
    .map((opec: JsonRecord) => hashed(nonNullEntries({
      sourceSystem: opec.sourceSystem,
      externalOpecId: opec.externalOpecId,
      familyCode: opec.familyCode,
      profileCode: opec.profileCode,
      convocationCode: opec.convocationCode,
      entityName: opec.entityName,
      positionName: opec.positionName,
      sourceReference: opec.source.reference,
      sourceUrl: opec.source.url,
      isActive: opec.status === "active",
      metadata: opec.metadata,
    })))
    .sort((left: JsonRecord, right: JsonRecord) => `${left.sourceSystem}:${left.externalOpecId}`.localeCompare(`${right.sourceSystem}:${right.externalOpecId}`));

  const questions = v4.candidates.map((candidate) => {
    const item = candidate.item;
    const options = Object.entries(item.options).map(([key, text]) => hashed({ key, text }));
    return hashed(nonNullEntries({
      id: item.id,
      domain: item.domain,
      topic: item.topic,
      competency: item.competency,
      questionType: item.questionType,
      cognitiveLevel: item.cognitiveLevel,
      estimatedDifficulty: difficultyValue(item.estimatedDifficulty),
      scope: item.scope,
      opecId: item.opecId,
      context: item.context,
      stem: item.stem,
      correctOption: item.correctAnswer,
      explanations: item.explanations,
      hint: item.hint,
      learningNote: item.learningNote,
      source: { reference: item.source.reference, type: "editorial_reference" },
      sourcePath: candidate.sourcePath,
      options,
    }));
  }).sort((left, right) => left.id.localeCompare(right.id));

  const approvedItemMappings = itemMap.mappings.filter(isApprovedItemMapping);
  const itemTargets = approvedItemMappings.flatMap((mapping: JsonRecord) => mapping.targets.map((target: JsonRecord) => hashed(nonNullEntries({
    questionId: mapping.itemId,
    targetType: target.type,
    familyCode: target.familyCode,
    profileCode: target.profileCode,
    sourceSystem: target.sourceSystem,
    externalOpecId: target.externalOpecId,
    evidence: { references: mapping.evidence, reviewedBy: mapping.reviewedBy, reviewedAt: mapping.reviewedAt },
  })))).sort((left: JsonRecord, right: JsonRecord) => canonicalJson(left).localeCompare(canonicalJson(right)));

  const knowledgeSources = knowledgeInventory.sources
    .filter(isVerifiedKnowledgeSource)
    .map((source: JsonRecord) => hashed(nonNullEntries({
      sourceId: source.sourceId,
      sourceType: source.sourceType,
      title: source.title,
      reference: source.reference,
      issuerOrAuthor: source.issuerOrAuthor,
      jurisdiction: source.jurisdiction,
      verifiedAt: new Date(source.verifiedAt).toISOString(),
      lastCheckedAt: source.lastCheckedAt,
      sourceSystem: source.sourceSystem,
      url: source.url,
      repoPath: source.repoPath,
      locator: source.locator,
      metadata: { verificationScope: source.verificationScope, rightsNote: source.rightsNote, notes: source.notes },
    }))).sort((left: JsonRecord, right: JsonRecord) => left.sourceId.localeCompare(right.sourceId));
  const verifiedSourceIds = new Set<string>(knowledgeSources.map((source: JsonRecord) => String(source.sourceId)));

  const knowledgeTargets = knowledgeMaps.flatMap((map: JsonRecord) => map.sources
    .filter((relation: JsonRecord) => isApprovedKnowledgeTarget(relation, verifiedSourceIds))
    .map((relation: JsonRecord) => hashed(nonNullEntries({
      sourceId: relation.sourceId,
      targetType: map.target.type,
      familyCode: map.target.familyCode,
      profileCode: map.target.profileCode,
      sourceSystem: map.target.sourceSystem,
      externalOpecId: map.target.externalOpecId,
      relevance: relation.relevance,
      locator: relation.locator,
      reason: relation.reason,
    })))).sort((left: JsonRecord, right: JsonRecord) => canonicalJson(left).localeCompare(canonicalJson(right)));

  const sourceIdByReference = new Map(knowledgeSources.map((source: JsonRecord) => [source.reference, source.sourceId]));
  const itemSources = questions.flatMap((question: JsonRecord) => {
    const sourceId = sourceIdByReference.get(question.source.reference);
    return sourceId ? [hashed({ questionId: question.id, sourceId, relationType: "decisive" })] : [];
  }).sort((left, right) => canonicalJson(left).localeCompare(canonicalJson(right)));

  const targetingPayload = { families, profiles, itemTargets };
  const knowledgePayload = { knowledgeSources, knowledgeTargets, itemSources };
  const plan: ContentSyncPlan = {
    baselineId: CLEAN_BASELINE_ID,
    gitSha,
    release: {
      bank: "question-bank-v4",
      manifestSourceSha: v4.sourceSha,
      expectedItemCount: v4.expectedCount,
    },
    hashes: {
      manifest: sha256(manifestRaw),
      corpus: v4.corpusHash,
      ids: v4.idsHash,
      targeting: sha256(canonicalJson(targetingPayload)),
      opec: sha256(canonicalJson(opecs)),
      knowledge: sha256(canonicalJson(knowledgePayload)),
    },
    entities: { families, profiles, opecs, questions, itemTargets, knowledgeSources, knowledgeTargets, itemSources },
    entityIds: {
      families: families.map((entity) => entity.code),
      profiles: profiles.map((entity) => entity.code),
      opecs: opecs.map((entity: JsonRecord) => `${entity.sourceSystem}:${entity.externalOpecId}`),
      questions: questions.map((entity) => entity.id),
      knowledgeSources: knowledgeSources.map((entity: JsonRecord) => entity.sourceId),
    },
  };
  return plan;
}

export function summarizeContentSyncPlan(plan: ContentSyncPlan) {
  return {
    gitSha: plan.gitSha,
    manifestHash: plan.hashes.manifest,
    corpusHash: plan.hashes.corpus,
    idsHash: plan.hashes.ids,
    targetingCatalogHash: plan.hashes.targeting,
    opecCatalogHash: plan.hashes.opec,
    knowledgeCatalogHash: plan.hashes.knowledge,
    planHash: calculateContentSyncPlanHash(plan),
    counts: Object.fromEntries(Object.entries(plan.entities).map(([key, value]) => [key, value.length])),
  };
}
