import assert from "node:assert/strict";
import { Client } from "pg";

const databaseUrl = process.env.QUESTION_BANK_SECURITY_TEST_DATABASE_URL
  ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const target = new URL(databaseUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(target.hostname)) {
  throw new Error("Security integration tests may run only against loopback PostgreSQL");
}

const roles = ["anon", "authenticated"];
const protectedObjects = [
  "question_releases", "questions", "question_options", "item_target_families",
  "item_target_profiles", "item_opec_targets", "knowledge_sources",
  "knowledge_source_targets", "item_source_links", "content_sync_runs",
  "v_question_bank_v4_active", "v_question_bank_v4_practice", "v_question_bank_v4_answered",
];

interface PrivilegeRow {
  can_select: boolean;
  can_insert: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface FunctionPrivilegeRow {
  prosecdef: boolean;
  proconfig: string[] | null;
  anon_execute: boolean;
  authenticated_execute: boolean;
  service_execute: boolean;
}

async function expectDenied(client: Client, role: string, sql: string) {
  await client.query("begin");
  try {
    await client.query(`set local role ${role}`);
    await client.query(sql);
    assert.fail(`${role} unexpectedly read protected editorial truth`);
  } catch (error) {
    assert.equal((error as { code?: string }).code, "42501");
  } finally {
    await client.query("rollback");
  }
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const privileges = await client.query(`
      select role_name, object_name,
        has_table_privilege(role_name, format('public.%I', object_name), 'SELECT') as can_select,
        has_table_privilege(role_name, format('public.%I', object_name), 'INSERT') as can_insert,
        has_table_privilege(role_name, format('public.%I', object_name), 'UPDATE') as can_update,
        has_table_privilege(role_name, format('public.%I', object_name), 'DELETE') as can_delete
      from unnest($1::text[]) role_name cross join unnest($2::text[]) object_name
    `, [roles, protectedObjects]) as { rows: PrivilegeRow[] };
    assert.equal(privileges.rows.every((row) => !row.can_select && !row.can_insert && !row.can_update && !row.can_delete), true);

    for (const role of roles) {
      await expectDenied(client, role, "select correct_option from public.questions limit 1");
      await expectDenied(client, role, "select option_text from public.question_options limit 1");
      await expectDenied(client, role, "select correct_option from public.v_question_bank_v4_answered limit 1");
    }

    const functions = await client.query(`
      select p.oid, p.proname, p.prosecdef, p.proconfig,
        has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
        has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
        has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname in ('advance_session_atomic', 'apply_content_sync', 'verify_content_sync')
    `) as { rows: FunctionPrivilegeRow[] };
    assert.equal(functions.rows.length, 3);
    assert.equal(functions.rows.every((row) => row.prosecdef && row.proconfig?.includes("search_path=public, pg_temp")), true);
    assert.equal(functions.rows.every((row) => !row.anon_execute && !row.authenticated_execute && row.service_execute), true);

    const preColumns = await client.query(`
      select table_name, column_name from information_schema.columns
      where table_schema = 'public' and table_name in ('v_question_bank_v4_active','v_question_bank_v4_practice')
        and column_name in ('correct_option','explanations','learning_note','source_reference')
    `);
    assert.equal(preColumns.rows.length, 0);

    await client.query("begin");
    await client.query("set local role service_role");
    await client.query("select correct_option from public.questions limit 1");
    await client.query("select option_text from public.question_options limit 1");
    await client.query("select * from public.v_question_bank_v4_answered limit 1");
    await client.query("rollback");

    console.log(JSON.stringify({ status: "passed", clientRolesDenied: roles, protectedObjects: protectedObjects.length, serviceRoleVerified: true }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.stack : error); process.exit(1); });
