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

test("Sprint governance reflects closed Sprint 33 baseline and active Sprint 38 prep", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");

  assert.match(status, /## Sprint 38 — activo/i);
  assert.match(sprintLog, /Sprint cerrado — Sprint 36: Tutor Hint Ladder, Misconception Feedback and Safe Modes/i);
  assert.match(sprintLog, /Sprint cerrado — Sprint 35: Tutor Support Contract Safe Evidence/i);

  assert.match(status, /\*\*Sprint actual:\*\*\s*Sprint 38 — Update Runtime Parity and Progressive Pipeline/i);
  assert.match(status, /Runtime publico\/VPS de Sprint 35-37\.1 validado en la misma corrida operacional/i);
  assert.match(status, /\*\*Sprint anterior cerrado:\*\*\s*Sprint 37\.1 — Runtime Parity & Operational Verification/i);

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
  assert.match(status, /no cuenta con anexos oficiales suficientes para promover `source_verified`/i);
  assert.match(normativeVerification, /PASS con WARN/i);
  assert.match(normativeVerification, /acuerdo oficial del concurso cargado en repo/i);
});

test("Semantic QA tolerances allow controlled decimal drift", async () => {
  const semanticAssertions = await readRepoFile("scripts/qa-e2e-semantic-assertions.js");

  assert.match(semanticAssertions, /TOPIC_STAT_AVG_DIFFICULTY_TOLERANCE\s*=\s*0\.02/i);
  assert.match(semanticAssertions, /avg_difficulty inconsistente en user_topic_stats/i);
});
