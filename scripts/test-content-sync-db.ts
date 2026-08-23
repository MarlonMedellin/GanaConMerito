import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { Client } from "pg";
import { buildContentSyncPlan, calculateContentSyncPlanHash, entityContentHash, type ContentSyncPlan } from "./lib/content-sync-plan";
import { diffContentSyncPlan } from "./lib/content-sync-database";
import { createClient } from "@supabase/supabase-js";

const databaseUrl = process.env.CONTENT_SYNC_TEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const target = new URL(databaseUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(target.hostname)) throw new Error("Content sync integration tests may run only against loopback PostgreSQL");

const managedTables = [
  "question_releases", "target_families", "target_profiles", "opec_catalog", "questions", "question_options",
  "item_target_families", "item_target_profiles", "item_opec_targets", "knowledge_sources",
  "knowledge_source_targets", "item_source_links",
] as const;

function hashed(record: Record<string, any>) {
  return { ...record, contentHash: entityContentHash(record) };
}

function buildRelationCoveragePlan(base: ContentSyncPlan): ContentSyncPlan {
  const plan = structuredClone(base);
  const evidence = { references: ["integration-test"], reviewedBy: "integration-test", reviewedAt: "2026-08-23T00:00:00.000Z" };
  plan.entities.opecs.push(hashed({
    sourceSystem: "integration-test", externalOpecId: "OPEC-TEST-001", familyCode: "docentes", profileCode: "coordinador",
    convocationCode: "TEST", entityName: "Entidad de prueba", positionName: "Coordinador de prueba",
    sourceReference: "integration-test", sourceUrl: "https://example.test/opec", isActive: true, metadata: { test: true },
  }));
  plan.entityIds.opecs.push("integration-test:OPEC-TEST-001");
  plan.entities.itemTargets.push(
    hashed({ questionId: "DOC-000001", targetType: "family", familyCode: "docentes", evidence }),
    hashed({ questionId: "DOC-000001", targetType: "profile", profileCode: "coordinador", evidence }),
    hashed({ questionId: "DOC-000001", targetType: "opec", sourceSystem: "integration-test", externalOpecId: "OPEC-TEST-001", evidence }),
  );
  plan.entities.knowledgeSources.push(hashed({
    sourceId: "integration-source", sourceType: "guide", title: "Integration source", reference: "Integration Source",
    issuerOrAuthor: "GCM Test", jurisdiction: "colombia", verifiedAt: "2026-08-23T00:00:00.000Z", lastCheckedAt: "2026-08-23",
    sourceSystem: "integration-test", url: "https://example.test/source", repoPath: "test/source", locator: "section-1", metadata: { test: true },
  }));
  plan.entityIds.knowledgeSources.push("integration-source");
  plan.entities.knowledgeTargets.push(
    hashed({ sourceId: "integration-source", targetType: "common", relevance: "core", locator: "section-1", reason: "common test" }),
    hashed({ sourceId: "integration-source", targetType: "family", familyCode: "docentes", relevance: "core", locator: "section-1", reason: "family test" }),
    hashed({ sourceId: "integration-source", targetType: "profile", profileCode: "coordinador", relevance: "core", locator: "section-1", reason: "profile test" }),
    hashed({ sourceId: "integration-source", targetType: "opec", sourceSystem: "integration-test", externalOpecId: "OPEC-TEST-001", relevance: "core", locator: "section-1", reason: "opec test" }),
  );
  plan.entities.itemSources.push(hashed({ questionId: "DOC-000001", sourceId: "integration-source", relationType: "decisive", locator: "section-1" }));
  return plan;
}

function expectedInitialWriteCounts(plan: ContentSyncPlan) {
  const itemTargets = plan.entities.itemTargets.reduce((counts, target) => {
    if (target.targetType === "family") counts.item_target_families += 1;
    else if (target.targetType === "profile") counts.item_target_profiles += 1;
    else if (target.targetType === "opec") counts.item_opec_targets += 1;
    else assert.fail(`Unexpected item target type: ${target.targetType}`);
    return counts;
  }, { item_target_families: 0, item_target_profiles: 0, item_opec_targets: 0 });

  return {
    question_releases: 1,
    target_families: plan.entities.families.length,
    target_profiles: plan.entities.profiles.length,
    opec_catalog: plan.entities.opecs.length,
    questions: plan.entities.questions.length,
    question_options: plan.entities.questions.reduce((count, question) => count + question.options.length, 0),
    ...itemTargets,
    knowledge_sources: plan.entities.knowledgeSources.length,
    knowledge_source_targets: plan.entities.knowledgeTargets.length,
    item_source_links: plan.entities.itemSources.length,
  };
}

function totalWrites(writeCounts: Record<string, number>) {
  return Object.values(writeCounts).reduce((total, count) => total + count, 0);
}

async function apply(client: Client, plan: ContentSyncPlan, approvedHash?: string) {
  const planHash = calculateContentSyncPlanHash(plan);
  const instance = await client.query("select instance_id from public.runtime_metadata where singleton");
  const result = await client.query({
    text: "select public.apply_content_sync($1::jsonb,$2,$3,'integration-test','postgres-integration',$4::uuid) as result",
    values: [JSON.stringify(plan), planHash, approvedHash ?? planHash, instance.rows[0].instance_id],
  });
  return result.rows[0].result as Record<string, any>;
}

async function managedStateHash(client: Client) {
  const result = await client.query(`
    select encode(extensions.digest(convert_to(jsonb_build_object(
      'question_releases', (select coalesce(jsonb_agg(to_jsonb(row) order by bank, manifest_hash), '[]') from public.question_releases row),
      'target_families', (select coalesce(jsonb_agg(to_jsonb(row) order by code), '[]') from public.target_families row),
      'target_profiles', (select coalesce(jsonb_agg(to_jsonb(row) order by code), '[]') from public.target_profiles row),
      'opec_catalog', (select coalesce(jsonb_agg(to_jsonb(row) order by source_system, external_opec_id), '[]') from public.opec_catalog row),
      'questions', (select coalesce(jsonb_agg(to_jsonb(row) order by id), '[]') from public.questions row),
      'question_options', (select coalesce(jsonb_agg(to_jsonb(row) order by question_id, option_key), '[]') from public.question_options row),
      'item_target_families', (select coalesce(jsonb_agg(to_jsonb(row) order by question_id, family_code), '[]') from public.item_target_families row),
      'item_target_profiles', (select coalesce(jsonb_agg(to_jsonb(row) order by question_id, profile_code), '[]') from public.item_target_profiles row),
      'item_opec_targets', (select coalesce(jsonb_agg(to_jsonb(row) order by question_id, opec_id), '[]') from public.item_opec_targets row),
      'knowledge_sources', (select coalesce(jsonb_agg(to_jsonb(row) order by source_id), '[]') from public.knowledge_sources row),
      'knowledge_source_targets', (select coalesce(jsonb_agg(to_jsonb(row) order by source_id, target_type, content_hash), '[]') from public.knowledge_source_targets row),
      'item_source_links', (select coalesce(jsonb_agg(to_jsonb(row) order by question_id, source_id, relation_type), '[]') from public.item_source_links row)
    )::text, 'UTF8'), 'sha256'), 'hex') as hash
  `);
  return result.rows[0].hash as string;
}

async function installDmlAudit(client: Client) {
  await client.query(`
    create table public.content_sync_dml_audit (id bigint generated always as identity primary key, table_name text not null, operation text not null);
    create function public.audit_content_sync_dml() returns trigger language plpgsql as $$
    begin insert into public.content_sync_dml_audit(table_name, operation) values (tg_table_name, tg_op); return coalesce(new, old); end $$;
  `);
  for (const table of managedTables) {
    await client.query(`create trigger audit_content_sync_dml after insert or update or delete on public.${table} for each row execute function public.audit_content_sync_dml()`);
  }
}

async function resetDmlAudit(client: Client) {
  await client.query("truncate table public.content_sync_dml_audit");
}

async function readDmlAudit(client: Client) {
  return (await client.query(`select table_name, operation, count(*)::integer as count from public.content_sync_dml_audit group by table_name, operation order by table_name, operation`)).rows;
}

async function removeDmlAudit(client: Client) {
  for (const table of managedTables) await client.query(`drop trigger if exists audit_content_sync_dml on public.${table}`);
  await client.query("drop function if exists public.audit_content_sync_dml(); drop table if exists public.content_sync_dml_audit");
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const startedAt = Date.now();
  let auditInstalled = false;
  try {
    await client.query(`truncate table public.content_sync_runs, public.item_source_links, public.knowledge_source_targets, public.knowledge_sources,
      public.item_opec_targets, public.item_target_profiles, public.item_target_families, public.question_options, public.questions,
      public.question_releases, public.opec_catalog, public.learning_profiles, public.target_profiles, public.target_families cascade`);
    await installDmlAudit(client);
    auditInstalled = true;

    const plan = buildRelationCoveragePlan(await buildContentSyncPlan(process.cwd()));
    const expectedWriteCounts = expectedInitialWriteCounts(plan);
    const expectedWrites = totalWrites(expectedWriteCounts);
    const first = await apply(client, plan);
    assert.equal(first.status, "succeeded");
    assert.equal(first.changed, expectedWrites);
    assert.equal(first.writes, expectedWrites);
    assert.equal(first.repaired, 0);
    assert.deepEqual(first.writeCounts, expectedWriteCounts);
    const corpus = await client.query(`select count(*)::integer as questions, (select count(*)::integer from public.question_options) as options,
      (select count(*)::integer from public.target_profiles) as profiles from public.questions`);
    assert.deepEqual(corpus.rows[0], { questions: 248, options: 992, profiles: 6 });

    const stateAfterFirstApply = await managedStateHash(client);
    await resetDmlAudit(client);
    const second = await apply(client, plan);
    assert.equal(second.status, "succeeded");
    assert.equal(second.changed, 0);
    assert.equal(second.writes, 0);
    assert.equal(second.repaired, 0);
    assert.equal(second.unchanged, expectedWrites);
    assert.deepEqual(second.writeCounts, Object.fromEntries(managedTables.map((table) => [table, 0])));
    assert.deepEqual(await readDmlAudit(client), []);
    assert.equal(await managedStateHash(client), stateAfterFirstApply);

    const localStatus = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8", shell: process.platform === "win32" });
    const localValues = new Map(localStatus.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
    }));
    const serviceRoleKey = process.env.CONTENT_SYNC_TEST_SERVICE_ROLE_KEY ?? localValues.get("SERVICE_ROLE_KEY") ?? localValues.get("SECRET_KEY");
    const apiUrl = localValues.get("API_URL") ?? "http://127.0.0.1:54321";
    assert.ok(serviceRoleKey, "Local Supabase service role key is required");
    const supabase = createClient(apiUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    assert.equal((await diffContentSyncPlan(supabase, plan)).changed, 0);

    await client.query(`
      update public.question_releases set git_sha = repeat('0', 40) where bank = 'question-bank-v4';
      update public.target_families set name = name || ' DRIFT' where code = 'docentes';
      update public.target_profiles set name = name || ' DRIFT' where code = 'coordinador';
      update public.opec_catalog set position_name = position_name || ' DRIFT' where source_system = 'integration-test';
      update public.questions set stem = stem || ' DRIFT' where id = 'DOC-000001';
      update public.question_options set option_text = option_text || ' DRIFT' where question_id = 'DOC-000001' and option_key = 'A';
      update public.item_target_families set evidence = '{"drift":true}'::jsonb where question_id = 'DOC-000001';
      update public.item_target_profiles set evidence = '{"drift":true}'::jsonb where question_id = 'DOC-000001';
      update public.item_opec_targets set evidence = '{"drift":true}'::jsonb where question_id = 'DOC-000001';
      update public.knowledge_sources set title = title || ' DRIFT' where source_id = 'integration-source';
      update public.knowledge_source_targets set reason = reason || ' DRIFT' where source_id = 'integration-source' and target_type = 'common';
      update public.item_source_links set locator = locator || ' DRIFT' where question_id = 'DOC-000001';
    `);
    assert.ok((await diffContentSyncPlan(supabase, plan)).changed >= 12);
    await resetDmlAudit(client);
    const repaired = await apply(client, plan);
    assert.equal(repaired.status, "succeeded");
    assert.equal(repaired.changed, 12);
    assert.equal(repaired.writes, 12);
    assert.equal(repaired.repaired, 12);
    assert.deepEqual(repaired.writeCounts, Object.fromEntries(managedTables.map((table) => [table, 1])));
    assert.deepEqual(await readDmlAudit(client), managedTables.slice().sort().map((table) => ({ table_name: table, operation: "UPDATE", count: 1 })));
    assert.equal((await diffContentSyncPlan(supabase, plan)).changed, 0);

    await client.query(`insert into public.item_target_families (question_id, family_code, evidence, content_hash)
      values ('DOC-000002', 'docentes', '{}'::jsonb, $1)`, ["0".repeat(64)]);
    await client.query(`
      insert into public.knowledge_sources (source_id, source_type, title, reference, verification_status, verified_at, content_hash)
      values ('obsolete-source', 'guide', 'Obsolete', 'Obsolete', 'verified', now(), repeat('0', 64));
      insert into public.knowledge_source_targets (source_id, target_type, relevance, reason, content_hash)
      values ('obsolete-source', 'common', 'core', 'obsolete', repeat('0', 64));
      insert into public.item_source_links (question_id, source_id, relation_type, content_hash)
      values ('DOC-000002', 'obsolete-source', 'supporting', repeat('0', 64));
    `);
    await resetDmlAudit(client);
    const removedRelation = await apply(client, plan);
    assert.equal(removedRelation.changed, 4);
    assert.equal(removedRelation.writes, 4);
    assert.equal(removedRelation.repaired, 4);
    assert.equal(removedRelation.removed, 4);
    assert.deepEqual(await readDmlAudit(client), [
      { table_name: "item_source_links", operation: "DELETE", count: 1 },
      { table_name: "item_target_families", operation: "DELETE", count: 1 },
      { table_name: "knowledge_source_targets", operation: "DELETE", count: 1 },
      { table_name: "knowledge_sources", operation: "DELETE", count: 1 },
    ]);
    assert.equal((await diffContentSyncPlan(supabase, plan)).changed, 0);

    const stableBeforeFailure = await managedStateHash(client);
    await assert.rejects(() => apply(client, plan, "0".repeat(64)), /APPROVED_PLAN_HASH_MISMATCH/);
    assert.equal(await managedStateHash(client), stableBeforeFailure);
    const missingItem = structuredClone(plan);
    missingItem.entities.questions.pop();
    missingItem.entityIds.questions.pop();
    await assert.rejects(() => apply(client, missingItem), /QUESTION_COUNT_MISMATCH/);
    assert.equal(await managedStateHash(client), stableBeforeFailure);
    const missingOption = structuredClone(plan);
    missingOption.entities.questions[0].options.pop();
    await assert.rejects(() => apply(client, missingOption), /QUESTION_OPTION_SET_MISMATCH/);
    assert.equal(await managedStateHash(client), stableBeforeFailure);

    const invalidTarget = structuredClone(plan);
    invalidTarget.entities.itemTargets.push(hashed({ questionId: "DOC-000001", targetType: "profile", profileCode: "profile-does-not-exist", evidence: {} }));
    const invalidTargetResult = await apply(client, invalidTarget);
    assert.equal(invalidTargetResult.status, "failed");
    assert.match(invalidTargetResult.error, /foreign key constraint/);
    assert.equal(await managedStateHash(client), stableBeforeFailure);

    await client.query("update public.questions set stem = stem || ' TRIGGER_DRIFT' where id = 'DOC-001105'");
    await client.query(`create function public.fail_content_sync_test() returns trigger language plpgsql as $$
      begin if new.id = 'DOC-001105' then raise exception 'TEST_INTERMEDIATE_FAILURE'; end if; return new; end $$;
      create trigger fail_content_sync_test before update on public.questions for each row execute function public.fail_content_sync_test()`);
    const beforeInjectedFailure = await managedStateHash(client);
    await resetDmlAudit(client);
    const failed = await apply(client, plan);
    assert.equal(failed.status, "failed");
    assert.match(failed.error, /TEST_INTERMEDIATE_FAILURE/);
    assert.equal(await managedStateHash(client), beforeInjectedFailure);
    assert.deepEqual(await readDmlAudit(client), []);
    await client.query("drop trigger fail_content_sync_test on public.questions; drop function public.fail_content_sync_test()");
    const afterFailureRepair = await apply(client, plan);
    assert.equal(afterFailureRepair.status, "succeeded");
    assert.equal(afterFailureRepair.changed, 1);
    assert.equal(afterFailureRepair.repaired, 1);

    const verified = await client.query("select public.verify_content_sync($1) as result", [calculateContentSyncPlanHash(plan)]);
    assert.equal(verified.rows[0].result.ok, true);

    console.log(JSON.stringify({ status: "passed", managedTables: managedTables.length, questions: plan.entities.questions.length,
      options: expectedWriteCounts.question_options, profiles: plan.entities.profiles.length,
      firstWrites: first.writes, secondWrites: second.writes, secondPhysicalDml: 0, driftRepairedWrites: repaired.repaired,
      driftAfterRepair: 0, obsoleteRowsDeleted: removedRelation.removed, atomicFailureRolledBack: true, durationMs: Date.now() - startedAt }, null, 2));
  } finally {
    if (auditInstalled) await removeDmlAudit(client);
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
