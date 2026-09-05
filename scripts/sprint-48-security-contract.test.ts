import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("clean V4 baseline denies raw question access to client roles", async () => {
  const migration = await readFile("supabase/migrations/0002_v4_runtime_security.sql", "utf8");
  for (const table of ["questions", "question_options", "question_releases", "v_question_bank_v4_active", "v_question_bank_v4_practice", "v_question_bank_v4_answered"]) {
    assert.match(migration, new RegExp(`revoke all on all tables|revoke all on table public\\.${table}`, "i"));
  }
  assert.match(migration, /revoke all on all functions in schema public from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.advance_session_atomic[\s\S]+to service_role/i);
  assert.match(migration, /security definer[\s\S]+set search_path = public, pg_temp/i);
});

test("pre-answer view contains no editorial truth", async () => {
  const migration = await readFile("supabase/migrations/0002_v4_runtime_security.sql", "utf8");
  const pre = migration.match(/create view public\.v_question_bank_v4_active[\s\S]+?(?=create view public\.v_question_bank_v4_practice)/i)?.[0] ?? "";
  assert.match(pre, /q\.context/);
  assert.match(pre, /q\.hint/);
  assert.doesNotMatch(pre, /correct_option|explanations|learning_note|source_reference/);
});

test("answer evaluation stays behind server service-role access", async () => {
  const route = await readFile("src/app/api/session/advance/route.ts", "utf8");
  assert.match(route, /getSupabaseAdminClient/);
  assert.match(route, /admin\.rpc\("(advance_session_atomic|submit_practice_attempt)"/);
  assert.ok(route.indexOf("admin.rpc") < route.indexOf("answerReview"));
});
