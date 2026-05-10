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

test("Sprint governance reflects closed Sprint 43 and closed Sprint 42 in current repo state", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");
  const backlog = await readRepoFile("docs/01-product/backlog.md");

  assert.match(status, /Sprint 43 .*Learning Paths \+ Misconception Signals - Base Implementation/i);
  assert.match(status, /Sprint 42 .*Rich Ingestion Normalization/i);
  assert.match(status, /capa base de señales pedagógicas ya integrada en repo/i);
  assert.match(status, /Sprint 43 — cerrado en repo/i);

  assert.match(sprintLog, /Sprint cerrado en repo — Sprint 43: Learning Paths \+ Misconception Signals - Base Implementation/i);
  assert.match(sprintLog, /Sprint cerrado en repo — Sprint 42: Rich Ingestion Normalization/i);
  assert.match(sprintLog, /learningSignals/i);

  assert.match(backlog, /Sprint 43 — Learning Paths \+ Misconception Signals - Base Implementation/i);
  assert.match(backlog, /Estado: CERRADO EN REPO\./i);

  await assertRepoFileExists("docs/03-architecture/semantic-governance-foundation-v1.md");
  await assertRepoFileExists("docs/02-delivery/sprint-42-rich-ingestion-normalization-plan.md");
  await assertRepoFileExists("docs/02-delivery/sprint-43-learning-paths-misconception-engine-plan.md");
});

test("Sprint 22 remains explicitly non-source-verified in current repo state", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");
  const normativeVerification = await readRepoFile("docs/02-delivery/tutor-gcm-normative-verification.md");

  assert.match(sprintLog, /Sprint cerrado — Sprint 22: Tutor GCM Normative Source Verification/i);
  assert.match(status, /synthesized_governed_unverified/i);
  assert.match(status, /no cuenta con anexos oficiales suficientes para promover `source_verified`/i);
  assert.match(normativeVerification, /PASS con WARN/i);
  assert.match(normativeVerification, /Acuerdo oficial del concurso cargado en repo/i);
});

test("Semantic QA tolerances allow controlled decimal drift", async () => {
  const semanticAssertions = await readRepoFile("scripts/qa-e2e-semantic-assertions.js");

  assert.match(semanticAssertions, /TOPIC_STAT_AVG_DIFFICULTY_TOLERANCE\s*=\s*0\.02/i);
  assert.match(semanticAssertions, /avg_difficulty inconsistente en user_topic_stats/i);
});
