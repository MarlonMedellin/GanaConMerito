import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";

async function readRepoFile(relativePath: string) {
  return readFile(resolve(process.cwd(), relativePath), "utf8");
}

async function assertRepoFileExists(relativePath: string) {
  await access(resolve(process.cwd(), relativePath));
}

test("Latest sprint contract is visible in sprint log and status", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");

  assert.match(sprintLog, /Sprint activo — Sprint 33: Stabilization, Governance and Runtime Confidence/i);
  assert.match(status, /Sprint actual:\s*Sprint 33 — Stabilization, Governance and Runtime Confidence/i);
  assert.match(status, /No abrir nuevas funcionalidades/i);

  await assertRepoFileExists("docs/02-delivery/sprint-33-stabilization-plan.md");
  await assertRepoFileExists("docs/03-architecture/api-contract-standard-v1.md");
  await assertRepoFileExists("docs/06-governance/runtime-release-rollback-policy.md");
  await assertRepoFileExists("docs/06-governance/qa-smoke-vs-forensic-policy.md");
  await assertRepoFileExists("docs/03-architecture/rate-limiting-adr-001.md");
  await assertRepoFileExists("docs/03-architecture/session-concurrency-adr-002.md");
  await assertRepoFileExists("docs/07-compliance/appsec-remediation-matrix-sprint-33.md");
});

test("Sprint 22 remains explicitly non-source-verified in current repo state", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");
  const normativeVerification = await readRepoFile("docs/02-delivery/tutor-gcm-normative-verification.md");

  assert.match(sprintLog, /Sprint cerrado — Sprint 22: Tutor GCM Normative Source Verification/i);
  assert.match(sprintLog, /CERRADO CON PASS CON WARN/i);
  assert.match(status, /synthesized_governed_unverified/i);
  assert.match(status, /no encuentra anexos oficiales suficientes para promover `source_verified`/i);
  assert.match(normativeVerification, /PASS con WARN/i);
  assert.match(normativeVerification, /acuerdo oficial del concurso cargado en repo/i);
});