import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

async function readRepoFile(path: string) {
  return readFile(resolve(process.cwd(), path), "utf8");
}

test("runtime selection is V4-only and never falls back to the legacy bank", async () => {
  const repository = await readRepoFile("src/lib/question-bank/v4-question-repository.ts");
  const selector = await readRepoFile("src/domain/item-selection/select-next-item.ts");
  const safeView = await readRepoFile("supabase/migrations/0022_v4_safe_runtime_view.sql");
  const preAnswerView = safeView.match(
    /create view public\.v_question_bank_v4_active[\s\S]+?(?=create view public\.v_question_bank_v4_practice)/i,
  )?.[0];

  assert.match(repository, /from\("v_question_bank_v4_active"\)/);
  assert.match(repository, /\.eq\("bank_version", "v4"\)/);
  assert.match(repository, /\.eq\("approval_status", "approved"\)/);
  assert.match(repository, /\.in\("pilot_status", ACTIVE_PILOT_STATES\)/);
  assert.match(selector, /V4QuestionRepository/);
  assert.doesNotMatch(`${repository}\n${selector}`, /runWithActiveItemBankFallback|v_item_bank_active/);
  assert.ok(preAnswerView);
  assert.match(safeView, /where ib\.bank_version = 'v4'/);
  assert.match(safeView, /grant select on table public\.v_question_bank_v4_active to service_role/i);
  assert.doesNotMatch(preAnswerView, /ib\.correct_option|ib\.explanation/);
});

test("pre-answer and post-answer contracts expose the required V4 fields at the right boundary", async () => {
  const sessionTypes = await readRepoFile("src/types/session.ts");
  const evaluationTypes = await readRepoFile("src/types/evaluation.ts");
  const itemRoute = await readRepoFile("src/app/api/session/item/route.ts");
  const advanceRoute = await readRepoFile("src/app/api/session/advance/route.ts");

  for (const field of ["context", "questionType", "cognitiveLevel", "sourceReference"]) {
    assert.match(sessionTypes, new RegExp(`${field}\\?:`));
  }
  assert.doesNotMatch(itemRoute, /correct_option|correctOption|explanations|learningNote/);
  for (const field of ["selectedExplanation", "correctExplanation", "learningNote", "sourceReference"]) {
    assert.match(evaluationTypes, new RegExp(`${field}\\?:`));
    assert.match(advanceRoute, new RegExp(field));
  }
});

test("empty V4 inventory reports a controlled state and alternatives", async () => {
  const startRoute = await readRepoFile("src/app/api/session/start/route.ts");
  const sessionTypes = await readRepoFile("src/types/session.ts");

  assert.match(startRoute, /no_active_v4_items/);
  assert.match(startRoute, /alternatives:/);
  assert.match(sessionTypes, /reason: "no_active_v4_items"/);
});

test("Tutor dossier uses the V4 repository and keeps pre/post evidence separate", async () => {
  const builder = await readRepoFile("src/lib/tutor/tutor-evidence-builder.ts");
  const tutorTypes = await readRepoFile("src/types/tutor-turn.ts");

  assert.match(builder, /new V4QuestionRepository\(\)/);
  assert.match(builder, /currentTurn\?\.selected_option[\s\S]+getAnsweredQuestion/);
  assert.match(builder, /getPracticeQuestion/);
  assert.doesNotMatch(builder, /normalizeLegacyItemToRichItem|runWithActiveItemBankFallback|v_item_bank_active/);
  for (const field of ["context", "questionType", "cognitiveLevel", "scope", "explanations", "hint", "learningNote"]) {
    assert.match(tutorTypes, new RegExp(`${field}\\?:`));
  }
});

test("OpenRouter remains post-response shadow and stores only minimized metrics", async () => {
  const route = await readRepoFile("src/app/api/tutor/turn/route.ts");
  const provider = await readRepoFile("src/lib/tutor/providers/openrouter-provider.ts");
  const migration = await readRepoFile("supabase/migrations/0023_tutor_shadow_metrics.sql");

  assert.match(route, /const result = await tutor\.generate/);
  assert.match(route, /after\(\(\) => runTutorShadow/);
  assert.ok(route.indexOf("const result = await tutor.generate") < route.indexOf("after(() => runTutorShadow"));
  assert.match(route, /NextResponse\.json\(result/);
  assert.doesNotMatch(route, /NextResponse\.json\([^\n]*shadow/i);
  for (const control of ["allow_fallbacks: false", "require_parameters: true", 'data_collection: "deny"', "zdr: true"]) {
    assert.match(provider, new RegExp(control.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(migration, /\b(?:prompt|visible_message|response_body|user_id|session_id)\s+(?:text|jsonb?|uuid)/i);
});
