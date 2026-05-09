import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

test("createUpdateJob crea job y reporte", async () => {
  const base = await mkdtemp(path.join(tmpdir(), "gcm-ops-"));
  process.env.GCM_OPS_DIR = base;
  const { createUpdateJob } = await import("./update-jobs");
  const job = await createUpdateJob("tests");

  const jobFile = JSON.parse(await readFile(path.join(base, "jobs", `${job.jobId}.json`), "utf8"));
  const reportFile = JSON.parse(await readFile(path.join(base, "reports", `${job.jobId}.json`), "utf8"));

  assert.equal(jobFile.status, "queued");
  assert.equal(reportFile.status, "queued");
});

test("readUpdateJobStatus devuelve unknown para inexistente y sanea", async () => {
  const base = await mkdtemp(path.join(tmpdir(), "gcm-ops-"));
  process.env.GCM_OPS_DIR = base;
  const { readUpdateJobStatus } = await import("./update-jobs");
  const status = await readUpdateJobStatus("../../etc/passwd");

  assert.equal(status.status, "unknown");
  assert.equal(status.jobId.includes("/"), false);
});
