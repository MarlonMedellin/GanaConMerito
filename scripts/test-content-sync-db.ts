import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { Client } from "pg";
import { buildContentSyncPlan, calculateContentSyncPlanHash } from "./lib/content-sync-plan";
import { diffContentSyncPlan } from "./lib/content-sync-database";
import { createClient } from "@supabase/supabase-js";

const databaseUrl = process.env.CONTENT_SYNC_TEST_DATABASE_URL
  ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const target = new URL(databaseUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(target.hostname)) {
  throw new Error("Content sync integration tests may run only against loopback PostgreSQL");
}

async function apply(client: Client, plan: any, approvedHash?: string) {
  const planHash = calculateContentSyncPlanHash(plan);
  const instance = await client.query("select instance_id from public.runtime_metadata where singleton");
  const result = await client.query({
    text: "select public.apply_content_sync($1::jsonb,$2,$3,'integration-test','postgres-integration',$4::uuid) as result",
    values: [JSON.stringify(plan), planHash, approvedHash ?? planHash, instance.rows[0].instance_id],
  });
  return result.rows[0].result as Record<string, any>;
}

async function stateHash(client: Client) {
  const result = await client.query(`
    select extensions.digest(convert_to(coalesce(string_agg(row_to_json(q)::text, '' order by q.id), ''), 'UTF8'), 'sha256') as hash,
      count(*)::integer as count
    from public.questions q
  `);
  return { hash: Buffer.from(result.rows[0].hash).toString("hex"), count: result.rows[0].count };
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const startedAt = Date.now();
  try {
    await client.query(`truncate table public.content_sync_runs, public.item_source_links,
      public.knowledge_source_targets, public.knowledge_sources, public.item_opec_targets,
      public.item_target_profiles, public.item_target_families, public.question_options,
      public.questions, public.question_releases, public.opec_catalog, public.learning_profiles,
      public.target_profiles, public.target_families cascade`);

    const plan = await buildContentSyncPlan(process.cwd());
    const first = await apply(client, plan);
    assert.equal(first.status, "succeeded");
    assert.equal(first.changed, 255);
    const corpus = await client.query(`
      select count(*)::integer as questions,
        (select count(*)::integer from public.question_options) as options,
        (select count(*)::integer from public.target_profiles) as profiles
      from public.questions
    `);
    assert.deepEqual(corpus.rows[0], { questions: 248, options: 992, profiles: 6 });

    const second = await apply(client, plan);
    assert.equal(second.status, "succeeded");
    assert.equal(second.changed, 0);
    assert.equal(second.unchanged, 255);

    const localStatus = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    const localValues = new Map(localStatus.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
    }));
    const serviceRoleKey = process.env.CONTENT_SYNC_TEST_SERVICE_ROLE_KEY
      ?? localValues.get("SERVICE_ROLE_KEY")
      ?? localValues.get("SECRET_KEY");
    const apiUrl = localValues.get("API_URL") ?? "http://127.0.0.1:54321";
    assert.ok(serviceRoleKey, "Local Supabase service role key is required");
    const supabase = createClient(apiUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    assert.equal((await diffContentSyncPlan(supabase, plan)).changed, 0);

    await client.query("update public.questions set stem = stem || ' DRIFT' where id = 'DOC-000001'");
    await client.query("update public.question_options set option_text = option_text || ' DRIFT' where question_id = 'DOC-000001' and option_key = 'A'");
    const repaired = await apply(client, plan);
    assert.equal(repaired.status, "succeeded");
    assert.equal(repaired.changed, 1);
    const repairedRows = await client.query("select stem from public.questions where id = 'DOC-000001'");
    assert.equal(repairedRows.rows[0].stem.includes("DRIFT"), false);

    await client.query(`insert into public.item_target_families
      (question_id, family_code, evidence, content_hash)
      values ('DOC-000001', 'docentes', '{}'::jsonb, $1)`, ["0".repeat(64)]);
    const relationDrift = await diffContentSyncPlan(supabase, plan);
    assert.equal(relationDrift.entities.find((entity) => entity.entity === "itemTargets")?.archiveOrRemove, 1);
    await apply(client, plan);
    assert.equal((await diffContentSyncPlan(supabase, plan)).changed, 0);

    const stableBeforeFailure = await stateHash(client);
    await assert.rejects(() => apply(client, plan, "0".repeat(64)), /APPROVED_PLAN_HASH_MISMATCH/);
    assert.deepEqual(await stateHash(client), stableBeforeFailure);

    const missingItem = structuredClone(plan);
    missingItem.entities.questions.pop();
    missingItem.entityIds.questions.pop();
    await assert.rejects(() => apply(client, missingItem), /QUESTION_COUNT_MISMATCH/);
    assert.deepEqual(await stateHash(client), stableBeforeFailure);

    const missingOption = structuredClone(plan);
    missingOption.entities.questions[0].options.pop();
    await assert.rejects(() => apply(client, missingOption), /QUESTION_OPTION_SET_MISMATCH/);
    assert.deepEqual(await stateHash(client), stableBeforeFailure);

    const invalidTarget = structuredClone(plan);
    invalidTarget.entities.itemTargets.push({
      questionId: "DOC-000001",
      targetType: "profile",
      profileCode: "profile-does-not-exist",
      evidence: {},
      contentHash: "0".repeat(64),
    });
    const invalidTargetResult = await apply(client, invalidTarget);
    assert.equal(invalidTargetResult.status, "failed");
    assert.match(invalidTargetResult.error, /foreign key constraint/);
    assert.deepEqual(await stateHash(client), stableBeforeFailure);

    await client.query("update public.questions set stem = stem || ' TRIGGER_DRIFT' where id = 'DOC-001105'");
    await client.query(`
      create function public.fail_content_sync_test() returns trigger language plpgsql as $$
      begin if new.id = 'DOC-001105' then raise exception 'TEST_INTERMEDIATE_FAILURE'; end if; return new; end $$;
      create trigger fail_content_sync_test before update on public.questions
      for each row execute function public.fail_content_sync_test();
    `);
    const beforeInjectedFailure = await stateHash(client);
    const failed = await apply(client, plan);
    assert.equal(failed.status, "failed");
    assert.match(failed.error, /TEST_INTERMEDIATE_FAILURE/);
    assert.deepEqual(await stateHash(client), beforeInjectedFailure);
    await client.query("drop trigger fail_content_sync_test on public.questions; drop function public.fail_content_sync_test()");
    const afterFailureRepair = await apply(client, plan);
    assert.equal(afterFailureRepair.status, "succeeded");
    assert.equal(afterFailureRepair.changed, 1);

    const verified = await client.query("select public.verify_content_sync($1) as result", [calculateContentSyncPlanHash(plan)]);
    assert.equal(verified.rows[0].result.ok, true);

    console.log(JSON.stringify({
      status: "passed",
      questions: 248,
      options: 992,
      profiles: 6,
      firstChanged: first.changed,
      secondChanged: second.changed,
      driftRepaired: repaired.changed,
      relationDriftRepaired: true,
      atomicFailureRolledBack: true,
      durationMs: Date.now() - startedAt,
    }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
