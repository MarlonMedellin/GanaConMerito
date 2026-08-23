import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("runtime selection is V4-only and has no legacy fallback", async () => {
  const [repository, selector] = await Promise.all([
    readFile("src/lib/question-bank/v4-question-repository.ts", "utf8"),
    readFile("src/domain/item-selection/select-next-item.ts", "utf8"),
  ]);
  assert.match(repository, /from\("v_question_bank_v4_active"\)/);
  assert.match(selector, /V4QuestionRepository/);
  assert.doesNotMatch(`${repository}\n${selector}`, /item_bank|v_item_bank_active|runWithActiveItemBankFallback|bank_version|pilot_status/);
});

test("selector implements OPEC plus profile plus family inheritance", async () => {
  const repository = await readFile("src/lib/question-bank/v4-question-repository.ts", "utf8");
  assert.match(repository, /item_opec_targets/);
  assert.match(repository, /item_target_profiles/);
  assert.match(repository, /item_target_families/);
  assert.match(repository, /opec_catalog/);
  assert.doesNotMatch(repository, /targetKind|primary|compatible/);
});

test("Tutor dossier separates safe pre-answer from server-only answered truth", async () => {
  const builder = await readFile("src/lib/tutor/tutor-evidence-builder.ts", "utf8");
  assert.match(builder, /new V4QuestionRepository\(\)/);
  assert.match(builder, /currentTurn\?\.selected_option[\s\S]+getAnsweredQuestion/);
  assert.match(builder, /getPracticeQuestion/);
  assert.doesNotMatch(builder, /normalizeLegacyItemToRichItem|v_item_bank_active/);
});

test("direct editorial database writes are disabled", async () => {
  const route = await readFile("src/app/api/content/upload/route.ts", "utf8");
  assert.match(route, /status: 410/);
  assert.match(route, /one-way content sync/);
  assert.doesNotMatch(route, /\.rpc\(|\.insert\(|\.upsert\(/);
});
