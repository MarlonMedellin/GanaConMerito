import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Client } from "pg";
import {
  buildV4ImportPlan,
  calculateV4PlanHash,
  canonicalJson,
  type V4ImportCandidate,
} from "../lib/v4-import-plan";

const databaseUrl = process.env.V4_IMPORT_TEST_DATABASE_URL
  ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const parsedUrl = new URL(databaseUrl);
if (!["127.0.0.1", "localhost"].includes(parsedUrl.hostname)) {
  throw new Error("Atomic V4 integration tests may run only against a loopback database.");
}

function cloneCandidates(candidates: V4ImportCandidate[]): V4ImportCandidate[] {
  return structuredClone(candidates);
}

function rehashCandidate(candidate: V4ImportCandidate) {
  candidate.contentHash = createHash("sha256")
    .update(canonicalJson(candidate.item))
    .digest("hex");
}

async function callBatch(
  client: Client,
  candidates: unknown,
  planHash: string,
  expectedCount: number,
  sourceSha: string,
) {
  const result = await client.query({
    text: `select * from public.import_question_bank_v4_batch($1::jsonb, $2, $3, $4)`,
    values: [JSON.stringify(candidates), planHash, expectedCount, sourceSha],
  });
  assert.equal(result.rows.length, 1);
  return result.rows[0] as {
    execution_id: string;
    status: "succeeded" | "failed";
    error_code: string | null;
    changed_count: number;
    unchanged_count: number;
    historical_deactivated_count: number;
    reconciliation_result: Record<string, unknown>;
  };
}

async function questionState(client: Client) {
  const result = await client.query(`
    select
      md5(coalesce(string_agg(to_jsonb(item)::text, '' order by item.content_id), '')) as item_hash,
      (select md5(coalesce(string_agg(to_jsonb(option)::text, '' order by option.item_id, option.option_key), ''))
         from public.item_options option
         join public.item_bank bank on bank.id = option.item_id
        where bank.bank_version = 'v4') as option_hash,
      count(*)::integer as item_count
    from public.item_bank item
    where item.bank_version = 'v4'
  `);
  return result.rows[0] as { item_hash: string; option_hash: string; item_count: number };
}

async function expectRejectedWithoutPartialWrites(
  client: Client,
  candidates: unknown,
  planHash: string,
  expectedCount: number,
  sourceSha: string,
  expectedError: string,
) {
  const before = await questionState(client);
  const result = await callBatch(client, candidates, planHash, expectedCount, sourceSha);
  assert.equal(result.status, "failed");
  assert.equal(result.error_code, expectedError);
  assert.equal(result.reconciliation_result.rolledBack, true);
  assert.equal(result.reconciliation_result.partialQuestionWrites, 0);
  assert.deepEqual(await questionState(client), before);
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const startedAt = Date.now();
  try {
    const plan = await buildV4ImportPlan(process.cwd());

    await client.query("delete from public.question_bank_v4_import_runs");
    await client.query("delete from public.item_bank where bank_version = 'v4'");

    const clean = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(clean.status, "succeeded");
    assert.equal(clean.changed_count, plan.expectedCount);
    assert.equal(clean.unchanged_count, 0);

    const imported = await client.query(`
      select count(*)::integer as item_count,
        count(*) filter (where status = 'draft' and is_active = false
          and is_published = false and pilot_status = 'not_in_pilot')::integer as safe_count
      from public.item_bank
      where bank_version = 'v4'
    `);
    assert.equal(imported.rows[0].item_count, plan.expectedCount);
    assert.equal(imported.rows[0].safe_count, plan.expectedCount);

    const optionCounts = await client.query(`
      select count(*)::integer as item_count
      from (
        select item.id
        from public.item_bank item
        join public.item_options option on option.item_id = item.id
        where item.bank_version = 'v4'
        group by item.id
        having count(*) = 4 and count(distinct option.option_key) = 4
      ) complete
    `);
    assert.equal(optionCounts.rows[0].item_count, plan.expectedCount);

    const second = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(second.status, "succeeded");
    assert.equal(second.changed_count, 0);
    assert.equal(second.unchanged_count, plan.expectedCount);
    assert.equal(second.reconciliation_result.canonicalPlanMatched, true);
    assert.equal(second.reconciliation_result.canonicalDataMismatches, 0);
    assert.equal(second.reconciliation_result.unsafeV4Rows, 0);
    assert.equal(second.reconciliation_result.orphanOptions, 0);

    const driftedId = plan.candidates[30].itemId;
    const driftedUuid = await client.query(
      "select id from public.item_bank where content_id = $1",
      [driftedId],
    );
    await client.query(`
      update public.item_bank
      set stem = stem || ' [drift-test]', source_reference = 'DRIFTED',
        status = 'published', is_active = true, is_published = true,
        pilot_status = 'pilot_running'
      where content_id = $1
    `, [driftedId]);
    await client.query(`
      update public.item_options option
      set option_text = option.option_text || ' [drift-test]'
      from public.item_bank item
      where option.item_id = item.id and item.content_id = $1 and option.option_key = 'A'
    `, [driftedId]);
    const repaired = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(repaired.status, "succeeded");
    assert.equal(repaired.changed_count, 1);
    assert.equal(repaired.unchanged_count, plan.expectedCount - 1);
    const repairedUuid = await client.query(
      "select id from public.item_bank where content_id = $1",
      [driftedId],
    );
    assert.equal(repairedUuid.rows[0].id, driftedUuid.rows[0].id);
    const afterRepair = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(afterRepair.changed_count, 0);
    assert.equal(afterRepair.unchanged_count, plan.expectedCount);

    await expectRejectedWithoutPartialWrites(
      client,
      { invalid: "batch-json" },
      plan.planHash,
      plan.expectedCount,
      plan.sourceSha,
      "INVALID_V4_BATCH_JSON",
    );

    const invalidItem = cloneCandidates(plan.candidates);
    delete (invalidItem[30].item as unknown as Record<string, unknown>).stem;
    rehashCandidate(invalidItem[30]);
    await expectRejectedWithoutPartialWrites(
      client,
      invalidItem,
      plan.planHash,
      plan.expectedCount,
      plan.sourceSha,
      "INVALID_V4_ITEM_CONTRACT",
    );

    const duplicateId = cloneCandidates(plan.candidates);
    duplicateId[duplicateId.length - 1] = structuredClone(duplicateId[0]);
    await expectRejectedWithoutPartialWrites(
      client,
      duplicateId,
      plan.planHash,
      plan.expectedCount,
      plan.sourceSha,
      "DUPLICATE_V4_ID",
    );

    await expectRejectedWithoutPartialWrites(
      client,
      plan.candidates,
      "0".repeat(64),
      plan.expectedCount,
      plan.sourceSha,
      "V4_MANIFEST_PLAN_MISMATCH",
    );

    const alternateCorpus = cloneCandidates(plan.candidates);
    alternateCorpus[30].item.stem = `${alternateCorpus[30].item.stem} [alternate-corpus]`;
    rehashCandidate(alternateCorpus[30]);
    await expectRejectedWithoutPartialWrites(
      client,
      alternateCorpus,
      calculateV4PlanHash(alternateCorpus),
      plan.expectedCount,
      plan.sourceSha,
      "V4_MANIFEST_PLAN_MISMATCH",
    );

    await expectRejectedWithoutPartialWrites(
      client,
      plan.candidates,
      plan.planHash,
      plan.expectedCount - 1,
      plan.sourceSha,
      "INVALID_V4_EXPECTED_COUNT",
    );

    await client.query(`
      update public.item_bank
      set stem = stem || ' [atomic-test]'
      where content_id = 'DOC-001105'
    `);
    await client.query(`
      create or replace function public.fail_v4_atomic_test()
      returns trigger language plpgsql as $$
      begin
        if new.content_id = 'DOC-001105' then
          raise exception 'TEST_INTERMEDIATE_WRITE_FAILURE';
        end if;
        return new;
      end;
      $$;
      create trigger trg_fail_v4_atomic_test
      before update on public.item_bank
      for each row execute function public.fail_v4_atomic_test();
    `);
    try {
      await expectRejectedWithoutPartialWrites(
        client,
        plan.candidates,
        plan.planHash,
        plan.expectedCount,
        plan.sourceSha,
        "V4_BATCH_IMPORT_FAILED",
      );
    } finally {
      await client.query("drop trigger if exists trg_fail_v4_atomic_test on public.item_bank");
      await client.query("drop function if exists public.fail_v4_atomic_test()");
    }
    const repairedAfterRollback = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(repairedAfterRollback.status, "succeeded");
    assert.equal(repairedAfterRollback.changed_count, 1);

    const historical = structuredClone(plan.candidates[0]);
    historical.item.id = "DOC-999999";
    historical.itemId = historical.item.id;
    historical.sourcePath = "content/question-bank-v4/items/docentes/DOC-999999.json";
    historical.approvalEvidence = { kind: "canonical-manifest", reference: "historical-test:DOC-999999" };
    rehashCandidate(historical);
    await client.query({
      text: `select * from public.upsert_content_item_v4($1::jsonb, $2, $3, $4)`,
      values: [JSON.stringify(historical.item), historical.sourcePath, historical.contentHash, historical.approvalEvidence.reference],
    });
    await client.query(`
      update public.item_bank
      set status = 'published', is_published = true, is_active = true,
        pilot_status = 'pilot_running'
      where content_id = 'DOC-999999'
    `);
    const reconcileHistorical = await callBatch(
      client, plan.candidates, plan.planHash, plan.expectedCount, plan.sourceSha,
    );
    assert.equal(reconcileHistorical.status, "succeeded");
    assert.equal(reconcileHistorical.historical_deactivated_count, 1);
    const preserved = await client.query(`
      select item.status, item.is_published, item.is_active, item.pilot_status,
        count(option.id)::integer as option_count
      from public.item_bank item
      join public.item_options option on option.item_id = item.id
      where item.content_id = 'DOC-999999'
      group by item.id
    `);
    assert.equal(preserved.rows.length, 1);
    assert.deepEqual(preserved.rows[0], {
      status: "draft",
      is_published: false,
      is_active: false,
      pilot_status: "not_in_pilot",
      option_count: 4,
    });

    const preAnswerColumns = await client.query(`
      select table_name, array_agg(column_name order by ordinal_position) as columns
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('v_question_bank_v4_active', 'v_question_bank_v4_practice')
      group by table_name
    `);
    for (const view of preAnswerColumns.rows) {
      assert.equal(view.columns.includes("context"), true, `${view.table_name} omits context`);
      assert.equal(view.columns.includes("hint"), true, `${view.table_name} omits hint`);
      for (const protectedColumn of [
        "correct_option", "explanation", "editorial_metadata",
        "option_explanations", "learning_note",
      ]) {
        assert.equal(view.columns.includes(protectedColumn), false, `${view.table_name} leaks ${protectedColumn}`);
      }
    }

    const permissions = await client.query(`
      select
        has_function_privilege('anon', 'public.import_question_bank_v4_batch(jsonb,text,integer,text)', 'EXECUTE') as anon_execute,
        has_function_privilege('authenticated', 'public.import_question_bank_v4_batch(jsonb,text,integer,text)', 'EXECUTE') as authenticated_execute,
        has_function_privilege('service_role', 'public.import_question_bank_v4_batch(jsonb,text,integer,text)', 'EXECUTE') as service_execute,
        has_function_privilege('service_role', 'public.import_question_bank_v4_batch_0028_unbound(jsonb,text,integer,text)', 'EXECUTE') as service_unbound_execute,
        has_function_privilege('service_role', 'public.question_bank_v4_item_matches(jsonb,text,text,text)', 'EXECUTE') as service_matcher_execute,
        has_function_privilege('anon', 'public.question_bank_v4_canonical_json(jsonb)', 'EXECUTE') as anon_helper_execute,
        has_function_privilege('service_role', 'public.question_bank_v4_canonical_json(jsonb)', 'EXECUTE') as service_helper_execute,
        has_table_privilege('anon', 'public.question_bank_v4_manifests', 'SELECT') as anon_manifest_select,
        has_table_privilege('authenticated', 'public.question_bank_v4_taxonomy_snapshot', 'SELECT') as authenticated_taxonomy_select,
        has_table_privilege('anon', 'public.question_bank_v4_import_runs', 'SELECT') as anon_audit_select,
        has_table_privilege('authenticated', 'public.question_bank_v4_import_runs', 'SELECT') as authenticated_audit_select,
        has_table_privilege('anon', 'public.v_question_bank_v4_active', 'SELECT') as anon_active_select,
        has_table_privilege('authenticated', 'public.v_question_bank_v4_practice', 'SELECT') as authenticated_practice_select,
        has_table_privilege('authenticated', 'public.v_question_bank_v4_answered', 'SELECT') as authenticated_answered_select,
        has_table_privilege('service_role', 'public.question_bank_v4_manifests', 'SELECT') as service_manifest_select,
        has_table_privilege('service_role', 'public.question_bank_v4_import_runs', 'SELECT') as service_audit_select,
        has_table_privilege('service_role', 'public.v_question_bank_v4_practice', 'SELECT') as service_practice_select,
        has_table_privilege('service_role', 'public.v_question_bank_v4_answered', 'SELECT') as service_answered_select
    `);
    assert.deepEqual(permissions.rows[0], {
      anon_execute: false,
      authenticated_execute: false,
      service_execute: true,
      service_unbound_execute: false,
      service_matcher_execute: false,
      anon_helper_execute: false,
      service_helper_execute: true,
      anon_manifest_select: false,
      authenticated_taxonomy_select: false,
      anon_audit_select: false,
      authenticated_audit_select: false,
      anon_active_select: false,
      authenticated_practice_select: false,
      authenticated_answered_select: false,
      service_manifest_select: true,
      service_audit_select: true,
      service_practice_select: true,
      service_answered_select: true,
    });

    const runAudit = await client.query(`
      select status, count(*)::integer as count
      from public.question_bank_v4_import_runs
      group by status order by status
    `);

    console.log(JSON.stringify({
      status: "passed",
      sourceSha: plan.sourceSha,
      corpusHash: plan.corpusHash,
      idsHash: plan.idsHash,
      planHash: plan.planHash,
      expectedCount: plan.expectedCount,
      cleanImportChanged: clean.changed_count,
      idempotentUnchanged: second.unchanged_count,
      historicalPreserved: true,
      failureCases: [
        "invalid-batch-json", "invalid-item-contract", "duplicate-id",
        "wrong-hash", "alternate-corpus", "wrong-count", "intermediate-write",
      ],
      runAudit: runAudit.rows,
      durationMs: Date.now() - startedAt,
    }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
