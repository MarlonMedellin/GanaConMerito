import { createClient } from "@supabase/supabase-js";
import { buildContentSyncPlan, calculateContentSyncPlanHash, summarizeContentSyncPlan } from "./lib/content-sync-plan";
import { applyContentSyncPlan, diffContentSyncPlan, readContentSyncStatus, readContentSyncTarget, verifyContentSyncPlan } from "./lib/content-sync-database";
import { assertContentSyncTarget } from "./lib/content-sync-guard";

type Mode = "validate" | "plan" | "diff" | "apply" | "verify" | "status";

function selectedMode(): Mode {
  const modes: Mode[] = ["validate", "plan", "diff", "apply", "verify", "status"];
  const selected = modes.filter((mode) => process.argv.includes(`--${mode}`));
  if (selected.length !== 1) throw new Error(`Select exactly one mode: ${modes.map((mode) => `--${mode}`).join(" | ")}`);
  return selected[0];
}

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function databaseClient() {
  const url = process.env.CONTENT_SYNC_SUPABASE_URL;
  const key = process.env.CONTENT_SYNC_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Database mode requires dedicated CONTENT_SYNC_SUPABASE_URL and CONTENT_SYNC_SUPABASE_SERVICE_ROLE_KEY");
  return { url, client: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) };
}

async function main() {
  const mode = selectedMode();
  const plan = await buildContentSyncPlan(process.cwd());
  const summary = summarizeContentSyncPlan(plan);
  if (mode === "validate" || mode === "plan") {
    console.log(JSON.stringify({ mode, valid: true, ...summary, note: "No se modificó Supabase." }, null, 2));
    return;
  }

  const { url, client } = databaseClient();
  const target = await readContentSyncTarget(client);
  if (mode === "status") {
    console.log(JSON.stringify({ mode, repository: summary, database: await readContentSyncStatus(client) }, null, 2));
    return;
  }
  const diff = await diffContentSyncPlan(client, plan);
  if (mode === "diff") {
    console.log(JSON.stringify({ mode, ...summary, target, diff }, null, 2));
    return;
  }
  if (mode === "verify") {
    const verification = await verifyContentSyncPlan(client, summary.planHash);
    console.log(JSON.stringify({ mode, ...summary, target, diff, verification }, null, 2));
    if (!verification?.ok || diff.changed !== 0 || diff.drift !== 0) process.exitCode = 1;
    return;
  }

  const approvedPlanHash = argument("approved-plan-hash");
  const requestedInstanceId = argument("target-instance-id");
  const guard = assertContentSyncTarget({
    environment: process.env.CONTENT_SYNC_ENVIRONMENT,
    url,
    plan,
    planHash: summary.planHash,
    approvedPlanHash,
    databaseBaselineId: target.baselineId,
    databaseInstanceId: target.instanceId,
    requestedInstanceId,
    repoRoot: process.cwd(),
  });
  const result = await applyContentSyncPlan(client, {
    plan,
    planHash: summary.planHash,
    approvedPlanHash: approvedPlanHash!,
    actor: process.env.CONTENT_SYNC_ACTOR ?? "codex",
    mechanism: process.env.CONTENT_SYNC_MECHANISM ?? "cli",
    targetInstanceId: target.instanceId,
  });
  const after = await diffContentSyncPlan(client, plan);
  console.log(JSON.stringify({ mode, ...summary, target: guard, before: diff, result, after }, null, 2));
  if (after.changed !== 0 || after.drift !== 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
