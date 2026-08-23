import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { advanceSessionSchema } from "../src/lib/validation/session";

async function readRepoFile(path: string) {
  return readFile(resolve(process.cwd(), path), "utf8");
}

test("Sprint 48 migration removes direct answer-bank access from client roles", async () => {
  const migration = await readRepoFile("supabase/migrations/0020_secure_question_answer_boundary.sql");

  assert.match(migration, /revoke all on table public\.item_bank from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.item_options from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.v_item_bank_active from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.v_question_bank_v4_active from public, anon, authenticated/i);
  assert.match(migration, /revoke execute on function public\.advance_session_atomic[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.advance_session_atomic[\s\S]+to service_role/i);
});

test("Sprint 48 rebuilds the three V4 read boundaries without cascade", async () => {
  const migration = await readRepoFile("supabase/migrations/0022_v4_safe_runtime_view.sql");

  assert.match(migration, /drop view if exists public\.v_question_bank_v4_practice/i);
  assert.match(migration, /drop view if exists public\.v_question_bank_v4_answered/i);
  assert.match(migration, /drop view if exists public\.v_question_bank_v4_active/i);
  assert.match(migration, /create view public\.v_question_bank_v4_active/i);
  assert.match(migration, /create view public\.v_question_bank_v4_practice/i);
  assert.match(migration, /create view public\.v_question_bank_v4_answered/i);
  assert.doesNotMatch(migration, /drop view[^;]+cascade/i);
  assert.match(migration, /revoke all on table public\.v_question_bank_v4_active from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.v_question_bank_v4_practice from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.v_question_bank_v4_answered from public, anon, authenticated/i);
  assert.match(migration, /grant select on table public\.v_question_bank_v4_answered to service_role/i);
});

test("Sprint 48 reconciles the governed V4 importer without replacing its historical overload", async () => {
  const migration = await readRepoFile("supabase/migrations/0024_reconcile_v4_import_signature.sql");

  assert.match(migration, /upsert_content_item_v4\(\s*p_item jsonb,\s*p_source_path text,\s*p_content_hash text,\s*p_approval_evidence text/i);
  assert.match(migration, /status = 'draft'[\s\S]+is_active = false/i);
  assert.match(migration, /revoke execute on function public\.upsert_content_item_v4\(jsonb, text, text, text\)[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.upsert_content_item_v4\(jsonb, text, text, text\)[\s\S]+to service_role/i);
});

test("Sprint 48 repairs V4 option counting without weakening importer grants", async () => {
  const migration = await readRepoFile("supabase/migrations/0025_fix_v4_option_count.sql");

  assert.match(migration, /pg_get_functiondef/);
  assert.match(migration, /jsonb_object_keys\(p_item->''options''\)/);
  assert.match(migration, /V4_IMPORT_OPTION_COUNT_EXPRESSION_NOT_FOUND/);
  assert.match(migration, /revoke execute on function public\.upsert_content_item_v4\(jsonb, text, text, text\)[\s\S]+from public, anon, authenticated/i);
});

test("Sprint 48 resolves content_id conflicts through the canonical unique constraint", async () => {
  const migration = await readRepoFile("supabase/migrations/0026_fix_v4_content_id_conflict.sql");

  assert.match(migration, /on conflict on constraint item_bank_content_id_unique do update set/i);
  assert.match(migration, /V4_IMPORT_CONTENT_ID_CONFLICT_CLAUSE_NOT_FOUND/);
  assert.match(migration, /revoke execute on function public\.upsert_content_item_v4\(jsonb, text, text, text\)[\s\S]+from public, anon, authenticated/i);
});

test("pre-answer route does not select or serialize answer-bearing fields", async () => {
  const route = await readRepoFile("src/app/api/session/item/route.ts");
  const sessionTypes = await readRepoFile("src/types/session.ts");

  assert.doesNotMatch(route, /correct_option|editorial_metadata|item\.explanation|rationale:/i);
  assert.doesNotMatch(sessionTypes, /^\s*rationale\?:/im);
  assert.match(route, /V4QuestionRepository/);
  assert.doesNotMatch(route, /runWithActiveItemBankFallback|getSupabaseAdminClient/);
});

test("answer evaluation and persistence use server-only service-role access", async () => {
  const route = await readRepoFile("src/app/api/session/advance/route.ts");

  assert.match(route, /getSupabaseAdminClient/);
  assert.match(route, /V4QuestionRepository/);
  assert.match(route, /admin\.rpc\("advance_session_atomic"/);
  assert.doesNotMatch(route, /supabase\.rpc\("advance_session_atomic"/);
  assert.ok(route.indexOf("admin.rpc") < route.indexOf("answerReview"));
});

test("answer review cannot be requested without submitting an option", () => {
  const parsed = advanceSessionSchema.safeParse({
    sessionId: "11111111-1111-4111-8111-111111111111",
    itemId: "22222222-2222-4222-8222-222222222222",
  });

  assert.equal(parsed.success, false);
});
