import type { SupabaseClient } from "@supabase/supabase-js";
import { canonicalJson } from "./v4-import-plan";
import { entityContentHash, type ContentSyncPlan } from "./content-sync-plan";

type Row = Record<string, any>;

export interface ContentSyncDiffEntity {
  entity: string;
  insert: number;
  update: number;
  unchanged: number;
  archiveOrRemove: number;
  driftIds: string[];
}

export interface ContentSyncDiff {
  changed: number;
  drift: number;
  entities: ContentSyncDiffEntity[];
}

async function selectAll(client: SupabaseClient, table: string, columns = "*") {
  const { data, error } = await client.from(table).select(columns).range(0, 9999);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as Row[];
}

function storedHashDiff(entity: string, planned: Row[], actual: Row[], plannedId: (row: Row) => string, actualId: (row: Row) => string): ContentSyncDiffEntity {
  const actualById = new Map(actual.map((row) => [actualId(row), row]));
  let insert = 0;
  let update = 0;
  let unchanged = 0;
  const driftIds: string[] = [];
  for (const row of planned) {
    const id = plannedId(row);
    const persisted = actualById.get(id);
    if (!persisted) insert += 1;
    else if ((persisted.content_hash ?? persisted.contentHash) !== row.contentHash) { update += 1; driftIds.push(id); }
    else unchanged += 1;
    actualById.delete(id);
  }
  return { entity, insert, update, unchanged, archiveOrRemove: actualById.size, driftIds };
}

function normalizeQuestionRow(row: Row, options: Row[]) {
  const source: Row = { reference: row.source_reference };
  if (row.source_locator) source.locator = row.source_locator;
  if (row.source_url) source.url = row.source_url;
  if (row.source_type) source.type = row.source_type;
  const record: Row = {
    id: row.id,
    domain: row.domain,
    topic: row.topic,
    competency: row.competency,
    questionType: row.question_type,
    cognitiveLevel: row.cognitive_level,
    estimatedDifficulty: Number(row.estimated_difficulty),
    scope: row.editorial_scope,
    context: row.context,
    stem: row.stem,
    correctOption: row.correct_option,
    explanations: row.explanations,
    hint: row.hint,
    learningNote: row.learning_note,
    source,
    sourcePath: row.source_path,
    options: options
      .filter((option) => option.question_id === row.id)
      .map((option) => ({ key: option.option_key, text: option.option_text, contentHash: entityContentHash({ key: option.option_key, text: option.option_text }) }))
      .sort((left, right) => left.key.localeCompare(right.key)),
  };
  if (row.editorial_opec_id) record.opecId = row.editorial_opec_id;
  return { ...record, contentHash: entityContentHash(record) };
}

function withContentHash(record: Row) {
  return { ...record, contentHash: entityContentHash(record) };
}

function defined(record: Row) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null && value !== undefined));
}

function normalizeOpecRow(row: Row) {
  return withContentHash(defined({
    sourceSystem: row.source_system,
    externalOpecId: row.external_opec_id,
    familyCode: row.family_code,
    profileCode: row.profile_code,
    convocationCode: row.convocation_code,
    entityName: row.entity_name,
    positionName: row.position_name,
    sourceReference: row.source_reference,
    sourceUrl: row.source_url,
    isActive: row.is_active,
    metadata: row.metadata,
  }));
}

function normalizeKnowledgeSourceRow(row: Row) {
  return withContentHash(defined({
    sourceId: row.source_id,
    sourceType: row.source_type,
    title: row.title,
    reference: row.reference,
    issuerOrAuthor: row.issuer_or_author,
    jurisdiction: row.jurisdiction,
    verifiedAt: new Date(row.verified_at).toISOString(),
    lastCheckedAt: row.last_checked_at,
    sourceSystem: row.source_system,
    url: row.source_url,
    repoPath: row.repo_path,
    locator: row.locator,
    metadata: row.metadata,
  }));
}

function relationId(row: Row) {
  return canonicalJson(Object.fromEntries(Object.entries(row).filter(([key]) => key !== "contentHash")));
}

export async function readContentSyncTarget(client: SupabaseClient) {
  const { data, error } = await client.from("runtime_metadata").select("baseline_id, environment_kind, instance_id").single();
  if (error || !data) throw new Error("Connected database is not a readable V4 clean baseline");
  return { baselineId: data.baseline_id as string, environmentKind: data.environment_kind as string, instanceId: data.instance_id as string };
}

export async function diffContentSyncPlan(client: SupabaseClient, plan: ContentSyncPlan): Promise<ContentSyncDiff> {
  const [families, profiles, opecs, releases, questions, options, familyTargets, profileTargets, opecTargets, knowledgeSources, knowledgeTargets, itemSources] = await Promise.all([
    selectAll(client, "target_families", "code,name,description,is_active"),
    selectAll(client, "target_profiles", "code,family_code,name,is_active"),
    selectAll(client, "opec_catalog"),
    selectAll(client, "question_releases"),
    selectAll(client, "questions"),
    selectAll(client, "question_options"),
    selectAll(client, "item_target_families"),
    selectAll(client, "item_target_profiles"),
    selectAll(client, "item_opec_targets"),
    selectAll(client, "knowledge_sources"),
    selectAll(client, "knowledge_source_targets"),
    selectAll(client, "item_source_links"),
  ]);
  const plannedFamilyIds = new Set(plan.entityIds.families);
  const plannedProfileIds = new Set(plan.entityIds.profiles);
  const plannedOpecIds = new Set(plan.entityIds.opecs);
  const opecById = new Map(opecs.map((row) => [row.id, row]));
  const actualQuestions = questions.filter((question) => question.sync_state === "current").map((question) => normalizeQuestionRow(question, options));
  const actualItemTargets = [
    ...familyTargets.map((row) => withContentHash({ questionId: row.question_id, targetType: "family", familyCode: row.family_code, evidence: row.evidence })),
    ...profileTargets.map((row) => withContentHash({ questionId: row.question_id, targetType: "profile", profileCode: row.profile_code, evidence: row.evidence })),
    ...opecTargets.map((row) => {
      const opec = opecById.get(row.opec_id);
      return withContentHash({ questionId: row.question_id, targetType: "opec", sourceSystem: opec?.source_system, externalOpecId: opec?.external_opec_id, evidence: row.evidence });
    }),
  ];
  const actualKnowledgeTargets = knowledgeTargets.map((row) => {
    const opec = row.opec_id ? opecById.get(row.opec_id) : undefined;
    return withContentHash(defined({
      sourceId: row.source_id,
      targetType: row.target_type,
      familyCode: row.family_code,
      profileCode: row.profile_code,
      sourceSystem: opec?.source_system,
      externalOpecId: opec?.external_opec_id,
      relevance: row.relevance,
      locator: row.locator,
      reason: row.reason,
    }));
  });
  const actualItemSources = itemSources.map((row) => withContentHash(defined({
    questionId: row.question_id,
    sourceId: row.source_id,
    relationType: row.relation_type,
    locator: row.locator,
  })));
  const plannedRelease = withContentHash({
    bank: plan.release.bank,
    gitSha: plan.gitSha,
    manifestSourceSha: plan.release.manifestSourceSha,
    manifestHash: plan.hashes.manifest,
    corpusHash: plan.hashes.corpus,
    idsHash: plan.hashes.ids,
    expectedItemCount: plan.release.expectedItemCount,
  });
  const actualReleases = releases
    .filter((row) => row.bank === plan.release.bank && row.manifest_hash === plan.hashes.manifest)
    .map((row) => withContentHash({
      bank: row.bank,
      gitSha: row.git_sha,
      manifestSourceSha: row.manifest_source_sha,
      manifestHash: row.manifest_hash,
      corpusHash: row.corpus_hash,
      idsHash: row.ids_hash,
      expectedItemCount: row.expected_item_count,
    }));
  const entities = [
    storedHashDiff("release", [plannedRelease], actualReleases, (row) => `${row.bank}:${row.manifestHash}`, (row) => `${row.bank}:${row.manifestHash}`),
    storedHashDiff("families", plan.entities.families, families.filter((row) => row.is_active || plannedFamilyIds.has(row.code)).map((row) => withContentHash({ code: row.code, name: row.name, description: row.description, isActive: row.is_active })), (row) => row.code, (row) => row.code),
    storedHashDiff("profiles", plan.entities.profiles, profiles.filter((row) => row.is_active || plannedProfileIds.has(row.code)).map((row) => withContentHash({ code: row.code, familyCode: row.family_code, name: row.name, isActive: row.is_active })), (row) => row.code, (row) => row.code),
    storedHashDiff("opecs", plan.entities.opecs, opecs.filter((row) => row.is_active || plannedOpecIds.has(`${row.source_system}:${row.external_opec_id}`)).map(normalizeOpecRow), (row) => `${row.sourceSystem}:${row.externalOpecId}`, (row) => `${row.sourceSystem}:${row.externalOpecId}`),
    storedHashDiff("questions", plan.entities.questions, actualQuestions, (row) => row.id, (row) => row.id),
    storedHashDiff("itemTargets", plan.entities.itemTargets, actualItemTargets, relationId, relationId),
    storedHashDiff("knowledgeSources", plan.entities.knowledgeSources, knowledgeSources.map(normalizeKnowledgeSourceRow), (row) => row.sourceId, (row) => row.sourceId),
    storedHashDiff("knowledgeTargets", plan.entities.knowledgeTargets, actualKnowledgeTargets, relationId, relationId),
    storedHashDiff("itemSources", plan.entities.itemSources, actualItemSources, relationId, relationId),
  ];
  const changed = entities.reduce((sum, entity) => sum + entity.insert + entity.update + entity.archiveOrRemove, 0);
  const drift = entities.reduce((sum, entity) => sum + entity.update + entity.archiveOrRemove, 0);
  return { changed, drift, entities };
}

export async function readContentSyncStatus(client: SupabaseClient) {
  const [target, runs, releases, questions] = await Promise.all([
    readContentSyncTarget(client),
    selectAll(client, "content_sync_runs", "id,git_sha,plan_hash,status,started_at,finished_at,counts,safe_error,verification_result"),
    selectAll(client, "question_releases", "id,bank,git_sha,manifest_hash,status,created_at,activated_at"),
    selectAll(client, "questions", "id,sync_state"),
  ]);
  runs.sort((left, right) => String(right.started_at).localeCompare(String(left.started_at)));
  return {
    target,
    lastSync: runs[0] ?? null,
    releases,
    questions: {
      current: questions.filter((row) => row.sync_state === "current").length,
      archived: questions.filter((row) => row.sync_state === "archived").length,
    },
  };
}

export async function applyContentSyncPlan(client: SupabaseClient, params: {
  plan: ContentSyncPlan;
  planHash: string;
  approvedPlanHash: string;
  actor: string;
  mechanism: string;
  targetInstanceId: string;
}) {
  const { data, error } = await client.rpc("apply_content_sync", {
    p_plan: params.plan,
    p_plan_hash: params.planHash,
    p_approved_plan_hash: params.approvedPlanHash,
    p_actor: params.actor,
    p_mechanism: params.mechanism,
    p_target_instance_id: params.targetInstanceId,
  });
  if (error) throw new Error(`Content sync failed safely: ${error.message}`);
  if (!data || data.status !== "succeeded") throw new Error(`Content sync rolled back safely: ${data?.error ?? "UNKNOWN_ERROR"}`);
  return data;
}

export async function verifyContentSyncPlan(client: SupabaseClient, planHash: string) {
  const { data, error } = await client.rpc("verify_content_sync", { p_plan_hash: planHash });
  if (error) throw new Error(`Content sync verification failed: ${error.message}`);
  return data;
}

export function contentSyncSnapshotFingerprint(value: unknown) {
  return entityContentHash({ snapshot: JSON.parse(canonicalJson(value)) });
}
