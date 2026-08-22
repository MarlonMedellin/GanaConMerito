import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildV4ImportPlan, collectApprovalEvidence } from "./lib/v4-import-plan";

test("current V4 bank forms one approved plan or rejects an open editorial batch", async () => {
  try {
    const plan = await buildV4ImportPlan(process.cwd());
    const legacyApproved = plan.candidates.filter((candidate) => candidate.approvalEvidence.kind === "legacy-register").length;
    const expansionApproved = plan.candidates.filter((candidate) => candidate.approvalEvidence.kind === "expansion-batch").length;
    assert.ok(plan.candidates.length > 0);
    assert.ok(legacyApproved > 0);
    assert.ok(expansionApproved > 0);
    assert.equal(legacyApproved + expansionApproved, plan.candidates.length);
    assert.match(plan.planHash, /^[a-f0-9]{64}$/);
  } catch (error) {
    assert.match(
      error instanceof Error ? error.message : String(error),
      /^(?:DOC|GEN)-\d{6}: missing APPROVED editorial evidence$/,
    );
  }
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
        "El control se completó antes de cerrar el lote.",
      ].join("\n"),
    }],
  );

  assert.equal(evidence.get("DOC-123456")?.reference, "DOC-EXPANSION-007:DOC-123456");
  assert.equal(evidence.has("DOC-123457"), false);
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
