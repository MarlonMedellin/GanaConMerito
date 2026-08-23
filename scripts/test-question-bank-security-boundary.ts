import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.QUESTION_BANK_SECURITY_TEST_DATABASE_URL
  ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const parsedUrl = new URL(databaseUrl);

if (!["127.0.0.1", "localhost", "::1"].includes(parsedUrl.hostname)) {
  throw new Error("Question-bank security integration tests may run only against loopback PostgreSQL.");
}

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/0030_security_question_bank_boundary_remediation.sql",
);
const clientRoles = ["anon", "authenticated"] as const;
const protectedObjects = [
  "item_bank",
  "item_options",
  "v_item_bank_active",
  "v_question_bank_v3_pilot",
  "v_question_bank_v4_active",
  "v_question_bank_v4_practice",
  "v_question_bank_v4_answered",
] as const;

async function expectRoleReadDenied(
  client: Client,
  role: typeof clientRoles[number],
  query: string,
) {
  await client.query("begin");
  try {
    await client.query(`set local role ${role}`);
    await client.query(query);
  } catch (error) {
    await client.query("rollback");
    const databaseError = error as { code?: string; message?: string };
    assert.equal(databaseError.code, "42501", databaseError.message);
    return;
  }
  await client.query("rollback");
  assert.fail(`${role} unexpectedly read an answer-bearing object`);
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  const migration = await readFile(migrationPath, "utf8");
  await client.connect();
  const startedAt = Date.now();

  try {
    // Reproduce remote-only drift, including an overload absent from the current
    // repository, then reapply the monotonic migration.
    await client.query(`
      grant select on table public.item_bank to anon, authenticated;
      grant select on table public.item_options to anon, authenticated;
      grant select on table public.v_item_bank_active to anon, authenticated;
      grant select on table public.v_question_bank_v3_pilot to anon, authenticated;

      create policy security_test_extra_read
        on public.item_bank for select to public using (true);

      create or replace function public.upsert_content_item_v4(p_security_test text)
      returns bigint
      language sql
      security definer
      as $security_test_function$
        select count(*) from public.item_bank
      $security_test_function$;
      grant execute on function public.upsert_content_item_v4(text)
        to anon, authenticated;
    `);

    await client.query(migration);

    const policies = await client.query(`
      select count(*)::integer as count
      from pg_policies
      where schemaname = 'public'
        and tablename in ('item_bank', 'item_options')
    `);
    assert.equal(policies.rows[0].count, 0);

    const objectPrivileges = await client.query(`
      select role_name, object_name,
        has_table_privilege(role_name, format('public.%I', object_name), 'SELECT') as can_select,
        has_table_privilege(role_name, format('public.%I', object_name), 'INSERT') as can_insert,
        has_table_privilege(role_name, format('public.%I', object_name), 'UPDATE') as can_update,
        has_table_privilege(role_name, format('public.%I', object_name), 'DELETE') as can_delete
      from unnest($1::text[]) role_name
      cross join unnest($2::text[]) object_name
      order by role_name, object_name
    `, [clientRoles, protectedObjects]);
    assert.equal(
      objectPrivileges.rows.every((row) => (
        row.can_select === false
        && row.can_insert === false
        && row.can_update === false
        && row.can_delete === false
      )),
      true,
    );

    for (const role of clientRoles) {
      await expectRoleReadDenied(
        client,
        role,
        "select correct_option, explanation from public.item_bank limit 1",
      );
      await expectRoleReadDenied(
        client,
        role,
        "select item_id, option_key, option_text from public.item_options limit 1",
      );
      await expectRoleReadDenied(
        client,
        role,
        "select correct_option, explanation from public.v_item_bank_active limit 1",
      );
      await expectRoleReadDenied(
        client,
        role,
        "select correct_option, explanation from public.v_question_bank_v3_pilot limit 1",
      );
    }

    const functions = await client.query(`
      with relevant as (
        select p.oid, p.proname, p.prosecdef, p.proconfig,
          pg_get_function_identity_arguments(p.oid) as arguments
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.prokind = 'f'
          and p.prosecdef
          and (
            p.proname in (
              'advance_session_atomic',
              'upsert_content_item',
              'upsert_content_item_v4',
              'import_question_bank_v4_batch',
              'import_question_bank_v4_batch_0028_unbound',
              'question_bank_v4_item_matches'
            )
            or pg_get_functiondef(p.oid) ~* '(item_bank|item_options)'
          )
      )
      select proname, arguments, prosecdef, proconfig,
        has_function_privilege('anon', oid, 'EXECUTE') as anon_execute,
        has_function_privilege('authenticated', oid, 'EXECUTE') as authenticated_execute,
        has_function_privilege('service_role', oid, 'EXECUTE') as service_execute
      from relevant
      order by proname, arguments
    `);
    assert.ok(functions.rows.length >= 7);
    assert.equal(functions.rows.every((row) => row.prosecdef === true), true);
    assert.equal(functions.rows.every((row) => (
      Array.isArray(row.proconfig)
      && row.proconfig.includes("search_path=public, pg_temp")
    )), true);
    assert.equal(functions.rows.every((row) => (
      row.anon_execute === false && row.authenticated_execute === false
    )), true);

    const syntheticOverload = functions.rows.find((row) => (
      row.proname === "upsert_content_item_v4"
      && row.arguments === "p_security_test text"
    ));
    assert.ok(syntheticOverload, "Dynamic overload hardening was not exercised");
    assert.equal(syntheticOverload.service_execute, true);

    for (const supportedName of [
      "advance_session_atomic",
      "upsert_content_item",
      "upsert_content_item_v4",
      "import_question_bank_v4_batch",
    ]) {
      const supportedFunctions = functions.rows.filter((row) => row.proname === supportedName);
      assert.ok(supportedFunctions.length > 0, `${supportedName} is missing`);
      assert.equal(supportedFunctions.every((row) => row.service_execute === true), true);
    }

    const viewColumns = await client.query(`
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name in (
          'v_question_bank_v4_active',
          'v_question_bank_v4_practice',
          'v_question_bank_v4_answered'
        )
        and column_name in (
          'correct_option',
          'explanation',
          'option_explanations',
          'learning_note'
        )
      order by table_name, column_name
    `);
    assert.equal(
      viewColumns.rows.some((row) => (
        row.table_name === "v_question_bank_v4_active"
        || row.table_name === "v_question_bank_v4_practice"
      )),
      false,
    );
    assert.equal(
      viewColumns.rows.some((row) => (
        row.table_name === "v_question_bank_v4_answered"
        && row.column_name === "correct_option"
      )),
      true,
    );

    await client.query("begin");
    await client.query("set local role service_role");
    await client.query("select correct_option from public.item_bank limit 1");
    await client.query("select option_text from public.item_options limit 1");
    await client.query("select * from public.v_question_bank_v4_answered limit 1");
    await client.query("rollback");

    console.log(JSON.stringify({
      status: "passed",
      migration: "0030_security_question_bank_boundary_remediation.sql",
      clientRolesDenied: clientRoles,
      protectedObjects: protectedObjects.length,
      relevantFunctions: functions.rows.length,
      dynamicOverloadHardened: true,
      serviceRoleVerified: true,
      durationMs: Date.now() - startedAt,
    }, null, 2));
  } finally {
    await client.query("reset role").catch(() => undefined);
    await client.query(
      "drop function if exists public.upsert_content_item_v4(text)",
    ).catch(() => undefined);
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
