import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("legacy migrations remain evidence but are absent from the executable baseline", async () => {
  const executable = await readdir("supabase/migrations");
  const legacy = await readdir("supabase/legacy-migrations");
  assert.deepEqual(executable.sort(), ["0001_v4_clean_foundation.sql", "0002_v4_runtime_security.sql", "0003_v4_content_sync.sql", "20260904232738_practice_tutor_authoritative_attempts.sql"]);
  assert.equal(legacy.length, 30);
  assert.ok(legacy.includes("0030_security_question_bank_boundary_remediation.sql"));
});

test("sync RPC is hash-bound, instance-bound, atomic and service-only", async () => {
  const migration = await readFile("supabase/migrations/0003_v4_content_sync.sql", "utf8");
  assert.match(migration, /APPROVED_PLAN_HASH_MISMATCH/);
  assert.match(migration, /EFFECTIVE_PLAN_HASH_MISMATCH/);
  assert.match(migration, /TARGET_BASELINE_OR_INSTANCE_MISMATCH/);
  assert.match(migration, /exception when others[\s\S]+status = 'failed'/i);
  assert.match(migration, /revoke all on function public\.apply_content_sync[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.apply_content_sync[\s\S]+to service_role/i);
  assert.match(migration, /set search_path = public, pg_temp/i);
});
