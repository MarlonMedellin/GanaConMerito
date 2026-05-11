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

  // Status checks
  assert.match(status, /Sprint 43/i);
  assert.match(status, /Learning Paths \+ Misconception Signals/i);
  assert.match(status, /Sprint 42/i);
  assert.match(status, /Rich Ingestion Normalization/i);
  assert.match(status, /senales pedagogicas/i);
  assert.match(status, /cerrado/i);

  // Sprint Log checks
  assert.match(sprintLog, /Sprint 43/i);
  assert.match(sprintLog, /Sprint 42/i);
  assert.match(sprintLog, /learningSignals/i);

  // Backlog checks
  assert.match(backlog, /Sprint 43/i);
  assert.match(backlog, /CERRADO/i);

  await assertRepoFileExists("docs/03-architecture/semantic-governance-foundation-v1.md");
  await assertRepoFileExists("docs/02-delivery/sprint-42-rich-ingestion-normalization-plan.md");
  await assertRepoFileExists("docs/02-delivery/sprint-43-learning-paths-misconception-engine-plan.md");
});

test("Sprint 22 remains explicitly non-source-verified in current repo state", async () => {
  const sprintLog = await readRepoFile("docs/02-delivery/sprint-log.md");
  const status = await readRepoFile("docs/project/status.md");
  const normativeVerification = await readRepoFile("docs/02-delivery/tutor-gcm-normative-verification.md");

  assert.match(sprintLog, /Sprint 22/i);
  assert.match(status, /synthesized_governed_unverified/i);
  assert.match(status, /no cuenta con anexos oficiales suficientes/i);
  assert.match(normativeVerification, /PASS con WARN/i);
  assert.match(normativeVerification, /Acuerdo oficial del concurso cargado en repo/i);
});

test("Semantic QA tolerances allow controlled decimal drift", async () => {
  const semanticAssertions = await readRepoFile("scripts/qa-e2e-semantic-assertions.js");

  assert.match(semanticAssertions, /TOPIC_STAT_AVG_DIFFICULTY_TOLERANCE\s*=\s*0\.02/i);
  assert.match(semanticAssertions, /avg_difficulty inconsistente en user_topic_stats/i);
});
