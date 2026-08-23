import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("0030 closes tables, answer-bearing views, and every discovered policy", async () => {
  const migration = await read("supabase/migrations/0030_security_question_bank_boundary_remediation.sql");

  assert.match(migration, /(?:^|\n)begin;[\s\S]+commit;\s*$/i);
  assert.match(migration, /revoke all on table public\.item_bank from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.item_options from public, anon, authenticated/i);
  for (const view of [
    "v_item_bank_active",
    "v_question_bank_v3_pilot",
    "v_question_bank_v4_active",
    "v_question_bank_v4_practice",
    "v_question_bank_v4_answered",
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${view} from public, anon, authenticated`, "i"),
    );
  }
  assert.match(migration, /from pg_policies[\s\S]+tablename in \('item_bank', 'item_options'\)/i);
  assert.match(migration, /drop policy if exists %I on %I\.%I/i);
  assert.match(migration, /QUESTION_BANK_CLIENT_TABLE_PRIVILEGE_REMAINS/i);
  assert.match(migration, /QUESTION_BANK_CLIENT_POLICY_REMAINS/i);
});

test("0030 discovers real SECURITY DEFINER overloads and fails closed", async () => {
  const migration = await read("supabase/migrations/0030_security_question_bank_boundary_remediation.sql");

  assert.match(migration, /from pg_proc p[\s\S]+p\.prosecdef[\s\S]+pg_get_functiondef\(p\.oid\) ~\* '\(item_bank\|item_options\)'/i);
  assert.match(migration, /p\.oid::regprocedure as identity/i);
  assert.match(migration, /revoke execute on function %s from public, anon, authenticated/i);
  assert.match(migration, /alter function %s set search_path = public, pg_temp/i);
  assert.match(migration, /QUESTION_BANK_CLIENT_FUNCTION_EXECUTE_REMAINS/i);
  assert.match(migration, /QUESTION_BANK_UNSAFE_FUNCTION_SEARCH_PATH/i);
  assert.match(migration, /QUESTION_BANK_SERVICE_ROLE_EXECUTE_MISSING/i);
  assert.doesNotMatch(migration, /drop function/i);
});

test("the real REST probe is CJS-safe, bodyless, authenticated locally, and wired into security", async () => {
  const [probe, packageJson, prWorkflow, databaseWorkflow] = await Promise.all([
    read("scripts/verify-question-bank-boundary.ts"),
    read("package.json"),
    read(".github/workflows/pr-checks.yml"),
    read(".github/workflows/question-bank-v4-atomic-import.yml"),
  ]);

  assert.match(probe, /async function main\(\)/);
  assert.match(probe, /main\(\)\.catch/);
  assert.doesNotMatch(probe, /^const .* = await /m);
  assert.match(probe, /method: "HEAD"/);
  assert.match(probe, /bodyRead: false/);
  assert.match(probe, /createLocalAuthenticatedToken/);
  assert.match(probe, /v_question_bank_v3_pilot/);

  const scripts = JSON.parse(packageJson).scripts as Record<string, string>;
  assert.match(scripts["test:security"], /question-bank-security-remediation-contract\.test\.ts/);
  assert.match(scripts["test:security"], /qa:security:question-bank -- --local/);
  assert.match(scripts["test:security"], /test:security:db/);
  assert.match(scripts["test:security:db"], /test-question-bank-security-boundary\.ts/);

  assert.match(prWorkflow, /Start isolated Supabase[\s\S]+supabase start/i);
  assert.match(prWorkflow, /Rebuild from all versioned migrations[\s\S]+supabase db reset --local/i);
  assert.match(databaseWorkflow, /Test question-bank security boundary[\s\S]+npm run test:security/i);
});
