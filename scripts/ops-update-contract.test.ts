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

test("Ops update flow preserves Sprint 38-39 web update contracts", async () => {
  const updatePage = await readRepoFile("src/app/update.html/page.tsx");
  const updateRoute = await readRepoFile("src/app/api/ops/update/route.ts");
  const statusRoute = await readRepoFile("src/app/api/ops/update/status/route.ts");
  const updateJobs = await readRepoFile("src/lib/ops/update-jobs.ts");
  const opsDoc = await readRepoFile("docs/05-ops/decoupled-update-worker.md");

  assert.match(updatePage, /type UpdateAction = "product" \| "deploy" \| "tests" \| "docker" \| "smoke" \| "all";/i);
  assert.match(updatePage, /\/api\/ops\/update\/status\?jobId=/i);
  assert.match(updatePage, /runtimeHead/i);
  assert.match(updatePage, /runtimeBuildTime/i);
  assert.match(updatePage, /productVsDeploy/i);
  assert.match(updatePage, /deployVsRuntime/i);
  assert.match(updatePage, /imageStale/i);
  assert.match(updatePage, /composeStale/i);

  assert.match(updateRoute, /createUpdateJob\(action\)/i);
  assert.doesNotMatch(updateRoute, /runWebUpdate\(/i);
  assert.match(updateRoute, /accepted: true/i);
  assert.match(updateRoute, /status: 202/i);
  assert.match(updateRoute, /cache-control/i);

  assert.match(statusRoute, /jobId es obligatorio/i);
  assert.match(statusRoute, /readUpdateJobStatus\(jobId\)/i);
  assert.match(statusRoute, /cache-control/i);

  assert.match(updateJobs, /status: "queued"/i);
  assert.match(updateJobs, /status: "unknown"/i);
  assert.match(updateJobs, /sanitizeJobId/i);
  assert.match(updateJobs, /reports/i);
  assert.match(updateJobs, /jobs/i);

  assert.match(opsDoc, /POST \/api\/ops\/update/i);
  assert.match(opsDoc, /GET \/api\/ops\/update\/status\?jobId=/i);
  assert.match(opsDoc, /`?update\.html`? hace polling cada 3 segundos/i);
});

test("Historical governance artifacts from Sprint 31 onward remain versioned", async () => {
  await assertRepoFileExists("docs/release/mvp-launch-governance-review-2026-05-07.md");
  await assertRepoFileExists("docs/05-ops/decoupled-update-worker.md");
});
