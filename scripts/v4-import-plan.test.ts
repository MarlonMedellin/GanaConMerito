import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildV4ImportPlan, collectApprovalEvidence } from "./lib/v4-import-plan";

test("current frozen V4 bank forms one deterministic approved 248-item plan", async () => {
  const plan = await buildV4ImportPlan(process.cwd());
  assert.equal(plan.candidates.length, 248);
  assert.equal(plan.expectedCount, 248);
  assert.equal(plan.candidates.every((candidate) => candidate.approvalEvidence.kind === "canonical-manifest"), true);
  assert.match(plan.sourceSha, /^[a-f0-9]{40}$/);
  assert.match(plan.corpusHash, /^[a-f0-9]{64}$/);
  assert.match(plan.idsHash, /^[a-f0-9]{64}$/);
  assert.match(plan.planHash, /^[a-f0-9]{64}$/);
});

test("open or count-mismatched editorial evidence authorizes nothing", () => {
  const open = collectApprovalEvidence("batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n", [{
    sourcePath: "OPEN.md",
    content: "**Estado:** EN PROGRESO\n| DOC-999999 | pendiente |",
  }]);
  const mismatched = collectApprovalEvidence("batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n", [{
    sourcePath: "BAD.md",
    content: "Rango: `DOC-123460`–`DOC-123462`\nSe aprobaron y serializaron 2 reactivos nuevos.",
  }]);
  assert.equal(open.size, 0);
  assert.equal(mismatched.size, 0);
});

test("a closed count-matched expansion authorizes only its explicit range", () => {
  const evidence = collectApprovalEvidence("batch_id,factory_decision,audit_decision,v4_item_id,v4_item_path,status\n", [{
    sourcePath: "CLOSED.md",
    content: "Lote: `DOC-X`\nRango: `DOC-123460`–`DOC-123462`\nSe aprobaron y serializaron 3 reactivos nuevos.",
  }]);
  assert.deepEqual([...evidence.keys()], ["DOC-123460", "DOC-123461", "DOC-123462"]);
});

async function withV4Fixture(run: (root: string) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "gcm-v4-plan-"));
  try {
    await fs.mkdir(path.join(root, "content"), { recursive: true });
    await fs.cp(
      path.join(process.cwd(), "content/question-bank-v4"),
      path.join(root, "content/question-bank-v4"),
      { recursive: true },
    );
    await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test("altered manifest, missing item and missing option fail closed", async () => {
  await withV4Fixture(async (root) => {
    const manifestPath = path.join(root, "content/question-bank-v4/MANIFEST.json");
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    manifest.editorialState.status = "OPEN";
    await fs.writeFile(manifestPath, JSON.stringify(manifest));
    await assert.rejects(() => buildV4ImportPlan(root), /not FROZEN/);
  });

  await withV4Fixture(async (root) => {
    await fs.rm(path.join(root, "content/question-bank-v4/items/docentes/DOC-000001.json"));
    await assert.rejects(() => buildV4ImportPlan(root), /count mismatch/);
  });

  await withV4Fixture(async (root) => {
    const itemPath = path.join(root, "content/question-bank-v4/items/docentes/DOC-000001.json");
    const item = JSON.parse(await fs.readFile(itemPath, "utf8"));
    delete item.options.D;
    await fs.writeFile(itemPath, JSON.stringify(item));
    await assert.rejects(() => buildV4ImportPlan(root));
  });
});
