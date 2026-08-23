import { execFileSync } from "node:child_process";
import type { ContentSyncPlan } from "./content-sync-plan";

const LOCAL_ENVIRONMENTS = new Set(["local", "test"]);

export function remoteContentSyncConfirmation(projectRef: string, planHash: string) {
  return `APPLY_CONTENT_SYNC_${projectRef}_${planHash}`;
}

export function assertContentSyncTarget(params: {
  environment?: string;
  url?: string;
  plan: ContentSyncPlan;
  planHash: string;
  approvedPlanHash?: string;
  databaseBaselineId?: string;
  databaseInstanceId?: string;
  requestedInstanceId?: string;
  repoRoot: string;
}) {
  const { environment, url, plan, planHash } = params;
  if (!environment || !url) throw new Error("CONTENT_SYNC_ENVIRONMENT and CONTENT_SYNC_SUPABASE_URL are required");
  if (params.databaseBaselineId !== plan.baselineId) throw new Error("Target is not a GanaConMerito V4 clean baseline");
  if (!params.databaseInstanceId || params.databaseInstanceId !== params.requestedInstanceId) {
    throw new Error("Target instance confirmation does not match the connected database");
  }
  if (!params.approvedPlanHash || params.approvedPlanHash !== planHash) {
    throw new Error("--approved-plan-hash must equal the effective canonical plan hash");
  }

  const target = new URL(url);
  if (LOCAL_ENVIRONMENTS.has(environment)) {
    if (!["127.0.0.1", "localhost"].includes(target.hostname)) {
      throw new Error("Local/test content sync refuses a non-local Supabase target");
    }
    return { environment, projectRef: null, remote: false };
  }

  if (!new Set(["preview", "staging", "production"]).has(environment)) {
    throw new Error("CONTENT_SYNC_ENVIRONMENT is not allowed");
  }
  if (process.env.CONTENT_SYNC_ALLOW_REMOTE !== "true") {
    throw new Error("Remote content sync requires CONTENT_SYNC_ALLOW_REMOTE=true");
  }
  const projectRef = process.env.CONTENT_SYNC_EXPECTED_PROJECT_REF;
  if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef) || target.hostname !== `${projectRef}.supabase.co`) {
    throw new Error("Remote Supabase URL does not match CONTENT_SYNC_EXPECTED_PROJECT_REF");
  }
  if (process.env.CONTENT_SYNC_EXPECTED_GIT_SHA !== plan.gitSha) {
    throw new Error("Remote content sync requires the exact checked-out Git SHA");
  }
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: params.repoRoot, encoding: "utf8" }).trim();
  if (dirty) throw new Error("Remote content sync requires a clean working tree");
  if (process.env.CONTENT_SYNC_REMOTE_CONFIRMATION !== remoteContentSyncConfirmation(projectRef, planHash)) {
    throw new Error("Remote content sync confirmation does not match the effective plan");
  }
  return { environment, projectRef, remote: true };
}
