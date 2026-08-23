import assert from "node:assert/strict";
import test from "node:test";
import { buildContentSyncPlan, calculateContentSyncPlanHash } from "./lib/content-sync-plan";
import { assertContentSyncTarget } from "./lib/content-sync-guard";

test("local apply requires the clean baseline, exact instance and exact approved hash", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  const planHash = calculateContentSyncPlanHash(plan);
  const valid = {
    environment: "local",
    url: "http://127.0.0.1:54321",
    plan,
    planHash,
    approvedPlanHash: planHash,
    databaseBaselineId: plan.baselineId,
    databaseInstanceId: "11111111-1111-4111-8111-111111111111",
    requestedInstanceId: "11111111-1111-4111-8111-111111111111",
    repoRoot: process.cwd(),
  };
  assert.equal(assertContentSyncTarget(valid).remote, false);
  assert.throws(() => assertContentSyncTarget({ ...valid, approvedPlanHash: "0".repeat(64) }));
  assert.throws(() => assertContentSyncTarget({ ...valid, databaseBaselineId: "legacy" }));
  assert.throws(() => assertContentSyncTarget({ ...valid, requestedInstanceId: "22222222-2222-4222-8222-222222222222" }));
  assert.throws(() => assertContentSyncTarget({ ...valid, url: "https://example.supabase.co" }));
});

test("remote targets fail closed without all remote-only gates", async () => {
  const plan = await buildContentSyncPlan(process.cwd());
  const planHash = calculateContentSyncPlanHash(plan);
  assert.throws(() => assertContentSyncTarget({
    environment: "production",
    url: "https://abcdefghijklmnopqrst.supabase.co",
    plan,
    planHash,
    approvedPlanHash: planHash,
    databaseBaselineId: plan.baselineId,
    databaseInstanceId: "11111111-1111-4111-8111-111111111111",
    requestedInstanceId: "11111111-1111-4111-8111-111111111111",
    repoRoot: process.cwd(),
  }));

  const previous = {
    allow: process.env.CONTENT_SYNC_ALLOW_REMOTE,
    ref: process.env.CONTENT_SYNC_EXPECTED_PROJECT_REF,
    sha: process.env.CONTENT_SYNC_EXPECTED_GIT_SHA,
  };
  try {
    process.env.CONTENT_SYNC_ALLOW_REMOTE = "true";
    process.env.CONTENT_SYNC_EXPECTED_PROJECT_REF = "abcdefghijklmnopqrst";
    process.env.CONTENT_SYNC_EXPECTED_GIT_SHA = "0".repeat(40);
    assert.throws(() => assertContentSyncTarget({
      environment: "production",
      url: "https://abcdefghijklmnopqrst.supabase.co",
      plan,
      planHash,
      approvedPlanHash: planHash,
      databaseBaselineId: plan.baselineId,
      databaseInstanceId: "11111111-1111-4111-8111-111111111111",
      requestedInstanceId: "11111111-1111-4111-8111-111111111111",
      repoRoot: process.cwd(),
    }), /exact checked-out Git SHA/);
  } finally {
    if (previous.allow === undefined) delete process.env.CONTENT_SYNC_ALLOW_REMOTE;
    else process.env.CONTENT_SYNC_ALLOW_REMOTE = previous.allow;
    if (previous.ref === undefined) delete process.env.CONTENT_SYNC_EXPECTED_PROJECT_REF;
    else process.env.CONTENT_SYNC_EXPECTED_PROJECT_REF = previous.ref;
    if (previous.sha === undefined) delete process.env.CONTENT_SYNC_EXPECTED_GIT_SHA;
    else process.env.CONTENT_SYNC_EXPECTED_GIT_SHA = previous.sha;
  }
});
