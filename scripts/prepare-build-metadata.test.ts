import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptPath = resolve(process.cwd(), "scripts/prepare-build-metadata.mjs");

test("Sprint 21 build metadata script honors explicit commit and build time", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "gcm-build-meta-explicit-"));

  try {
    await execFileAsync("node", [scriptPath], {
      cwd,
      env: {
        ...process.env,
        NEXT_PUBLIC_APP_COMMIT: "9cd7ce4",
        NEXT_PUBLIC_APP_BUILD_TIME: "2026-05-06T23:08:12Z",
      },
    });

    const payload = JSON.parse(await readFile(join(cwd, ".build-meta.json"), "utf8"));
    assert.equal(payload.commit, "9cd7ce4");
    assert.equal(payload.buildTime, "2026-05-06T23:08:12Z");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("Sprint 21 build metadata script generates build time when not provided", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "gcm-build-meta-generated-"));
  const environmentWithoutBuildTime = { ...process.env };
  delete environmentWithoutBuildTime.NEXT_PUBLIC_APP_BUILD_TIME;

  try {
    await execFileAsync("node", [scriptPath], {
      cwd,
      env: {
        ...environmentWithoutBuildTime,
        NEXT_PUBLIC_APP_COMMIT: "9cd7ce4",
      },
    });

    const payload = JSON.parse(await readFile(join(cwd, ".build-meta.json"), "utf8"));
    assert.equal(payload.commit, "9cd7ce4");
    assert.match(payload.buildTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
