import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assertV4ImportTarget,
  productionImportConfirmation,
} from "./lib/v4-production-guard";
import test from "node:test";
import { buildV4ImportPlan, collectApprovalEvidence } from "./lib/v4-import-plan";

test("current V4 bank forms one approved plan or rejects an open editorial batch", async () => {
  const plan = await buildV4ImportPlan(process.cwd());
  const manifestApproved = plan.candidates.filter(
    (candidate) => candidate.approvalEvidence.kind === "canonical-manifest",
  ).length;
  assert.equal(plan.candidates.length, 248);
  assert.equal(plan.expectedCount, 248);
  assert.equal(manifestApproved, plan.candidates.length);
  assert.match(plan.sourceSha, /^[a-f0-9]{40}$/);
  assert.match(plan.corpusHash, /^[a-f0-9]{64}$/);
  assert.match(plan.idsHash, /^[a-f0-9]{64}$/);
  assert.match(plan.planHash, /^[a-f0-9]{64}$/);
});

test("open expansion batches do not authorize items", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{ sourcePath: "content/question-bank-v4/EXPANSION-BATCH-OPEN.md", content: "**Batch:** `OPEN-1`\n**Estado:** EN PROGRESO\n| DOC-999999 | pendiente |" }],
  );
  assert.equal(evidence.has("DOC-999999"), false);
});

test("closed narrative expansion reports authorize only IDs listed in their table", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{
      sourcePath: "content/question-bank-v4/EXPANSION-BATCH-07.md",
      content: [
        "Lote: `DOC-EXPANSION-007`",
        "Se aprobaron y serializaron 1 reactivos nuevos.",
        "| ID | Constructo |",
        "|---|---|",
        "| DOC-123456 | ejemplo |",
        "Siguiente ID previsto: `DOC-123457`.",
      ].join("\n"),
    }],
  );

  assert.equal(evidence.get("DOC-123456")?.reference, "DOC-EXPANSION-007:DOC-123456");
  assert.equal(evidence.has("DOC-123457"), false);
});

test("closed narrative expansion reports may authorize a count-matched contiguous range", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{
      sourcePath: "content/question-bank-v4/EXPANSION-BATCH-09.md",
      content: [
        "Lote: `DOC-EXPANSION-009`",
        "Rango: `DOC-123460`–`DOC-123462`",
        "Se aprobaron y serializaron 3 reactivos nuevos sobre:",
      ].join("\n"),
    }],
  );

  assert.deepEqual(
    [...evidence.keys()],
    ["DOC-123460", "DOC-123461", "DOC-123462"],
  );
});

test("a range whose size differs from the approved count authorizes nothing", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{
      sourcePath: "content/question-bank-v4/EXPANSION-BATCH-BAD.md",
      content: "Rango: `DOC-123460`–`DOC-123462`\nSe aprobaron y serializaron 2 reactivos nuevos.",
    }],
  );

  assert.equal(evidence.size, 0);
});

test("a completed phase closure authorizes only count-matched microblock ranges", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{
      sourcePath: "content/question-bank-v4/EXPANSION-PHASE-A-CLOSURE-4.md",
      content: [
        "**Estado:** COMPLETADO",
        "**Expansión:** +4 reactivos aprobados",
        "| Bloque | Rango | Nuevos | Núcleo |",
        "|---|---|---:|---|",
        "| A1 | `DOC-123470`–`DOC-123471` | 2 | uno |",
        "| A2 | `DOC-123472`–`DOC-123473` | 2 | dos |",
      ].join("\n"),
    }],
  );

  assert.deepEqual(
    [...evidence.keys()],
    ["DOC-123470", "DOC-123471", "DOC-123472", "DOC-123473"],
  );
});

test("an incomplete phase never authorizes its planned ranges", () => {
  const evidence = collectApprovalEvidence(
    "batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n",
    [{
      sourcePath: "content/question-bank-v4/EXPANSION-PHASE-A-PLAN.md",
      content: [
        "**Estado:** EN EJECUCIÓN",
        "**Meta:** +4 reactivos aprobados",
        "| A1 | `DOC-123470`–`DOC-123473` | 4 | uno |",
      ].join("\n"),
    }],
  );

  assert.equal(evidence.size, 0);
});

test("V4 upsert remains service-only, idempotent and inactive by default", async () => {
  const migration = await readFile(
    "supabase/migrations/0021_upsert_question_bank_v4.sql",
    "utf8",
  );

  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = public, pg_temp/i);
  assert.match(migration, /revoke execute[\s\S]*from public, anon, authenticated/i);
  assert.match(migration, /grant execute[\s\S]*to service_role/i);
  assert.match(migration, /v_existing_hash = p_content_hash[\s\S]*v_existing_approval = p_approval_evidence/i);
  assert.match(migration, /is_published = false[\s\S]*status = 'draft'[\s\S]*is_active = false/i);
});

test("V4 importer uses one atomic batch RPC and isolated credentials", async () => {
  const importer = await readFile("scripts/import-question-bank-v4.ts", "utf8");
  const migration = await readFile(
    "supabase/migrations/0028_atomic_v4_batch_import.sql",
    "utf8",
  );

  assert.match(importer, /rpc\("import_question_bank_v4_batch"/);
  assert.doesNotMatch(importer, /rpc\("upsert_content_item_v4"/);
  assert.match(importer, /V4_IMPORT_SUPABASE_URL/);
  assert.match(importer, /V4_IMPORT_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(importer, /V4_IMPORT_EXPECTED_PROJECT_REF/);
  assert.match(importer, /V4_IMPORT_EXPECTED_GIT_SHA/);
  assert.match(importer, /V4_IMPORT_PRODUCTION_CONFIRMATION/);
  assert.match(migration, /perform pg_advisory_xact_lock/i);
  assert.match(migration, /exception when others/i);
  assert.match(migration, /partialQuestionWrites', 0/i);
  assert.match(migration, /revoke execute[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute[\s\S]+to service_role/i);
  assert.match(migration, /set search_path = public, pg_temp/i);
});

test("V4 production import requires exact project, SHA, critical files and plan confirmation", () => {
  const projectRef = "abcdefghijklmnopqrst";
  const planHash = "a".repeat(64);
  const gitSha = "b".repeat(40);
  const valid = {
    environment: "production",
    url: `https://${projectRef}.supabase.co`,
    expectedProjectRef: projectRef,
    expectedGitSha: gitSha,
    currentGitSha: gitSha,
    workingTreeClean: true,
    confirmation: productionImportConfirmation(projectRef, 248, planHash),
    planHash,
    expectedCount: 248,
  };

  assert.deepEqual(assertV4ImportTarget(valid), { environment: "production", projectRef });
  assert.throws(() => assertV4ImportTarget({ ...valid, url: "https://wrong.supabase.co" }));
  assert.throws(() => assertV4ImportTarget({ ...valid, expectedGitSha: "c".repeat(40) }));
  assert.throws(() => assertV4ImportTarget({ ...valid, workingTreeClean: false }));
  assert.throws(() => assertV4ImportTarget({ ...valid, confirmation: "APPLY" }));
});

test("V4 hardening binds the canonical plan and revokes the unbound implementation", async () => {
  const migration = await readFile(
    "supabase/migrations/0029_harden_v4_manifest_reconciliation.sql",
    "utf8",
  );

  assert.match(migration, /expected_plan_hash/);
  assert.match(migration, /6f09c0fc60c9b7cb47ba4e9d076589207c051cf8b63fe0468f87c9bd42f2f418/);
  assert.match(migration, /V4_MANIFEST_PLAN_MISMATCH/);
  assert.match(migration, /question_bank_v4_item_matches/);
  assert.match(migration, /jsonb_object_agg\(option\.option_key, option\.option_text/);
  assert.match(migration, /rename to import_question_bank_v4_batch_0028_unbound/);
  assert.match(migration, /revoke execute[\s\S]+import_question_bank_v4_batch_0028_unbound[\s\S]+service_role/i);
  assert.match(migration, /canonicalDataMismatches/);
  assert.match(migration, /orphanOptions/);
  assert.match(migration, /set search_path = public, pg_temp/i);
});

test("isolated V4 imports still reject the application Supabase URL", () => {
  const url = "http://127.0.0.1:54321";
  assert.throws(() => assertV4ImportTarget({
    environment: "staging",
    url,
    expectedProjectRef: undefined,
    expectedGitSha: undefined,
    currentGitSha: "b".repeat(40),
    workingTreeClean: true,
    confirmation: undefined,
    planHash: "a".repeat(64),
    expectedCount: 248,
    applicationUrl: url,
  }));
});
