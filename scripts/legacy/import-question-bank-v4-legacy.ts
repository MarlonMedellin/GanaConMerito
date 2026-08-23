import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildV4ImportPlan } from "../lib/v4-import-plan";
import { assertV4ImportTarget } from "./v4-production-guard-legacy";

const CRITICAL_IMPORT_FILES = [
  "scripts/import-question-bank-v4.ts",
  "scripts/lib/v4-import-plan.ts",
  "scripts/lib/v4-production-guard.ts",
  "src/domain/content/v4-contract.ts",
  "content/question-bank-v4/MANIFEST.json",
  "content/question-bank-v4/taxonomy/domains.json",
  "content/question-bank-v4/taxonomy/topics.json",
  "content/question-bank-v4/taxonomy/competencies.json",
  "content/question-bank-v4/taxonomy/question-types.json",
  "supabase/migrations/0029_harden_v4_manifest_reconciliation.sql",
] as const;

function normalizedText(value: string | Buffer) {
  return value.toString().replaceAll("\r\n", "\n");
}

function readGitState() {
  const currentGitSha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const workingTreeClean = CRITICAL_IMPORT_FILES.every((sourcePath) => {
    const committed = execFileSync("git", ["show", `${currentGitSha}:${sourcePath}`]);
    return normalizedText(committed) === normalizedText(readFileSync(sourcePath));
  });
  return { currentGitSha, workingTreeClean };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const plan = await buildV4ImportPlan(process.cwd());

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      candidateCount: plan.candidates.length,
      sourceSha: plan.sourceSha,
      corpusHash: plan.corpusHash,
      idsHash: plan.idsHash,
      planHash: plan.planHash,
      approvedEvidence: {
        canonicalManifest: plan.candidates.filter((candidate) => candidate.approvalEvidence.kind === "canonical-manifest").length,
      },
      note: "No se modificó Supabase.",
    }, null, 2));
    return;
  }

  const environment = process.env.V4_IMPORT_ENVIRONMENT;
  const url = process.env.V4_IMPORT_SUPABASE_URL;
  const serviceRoleKey = process.env.V4_IMPORT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing dedicated V4 import URL or service-role key for --apply.");
  }
  const gitState = readGitState();
  const target = assertV4ImportTarget({
    environment,
    url,
    expectedProjectRef: process.env.V4_IMPORT_EXPECTED_PROJECT_REF,
    expectedGitSha: process.env.V4_IMPORT_EXPECTED_GIT_SHA,
    currentGitSha: gitState.currentGitSha,
    workingTreeClean: gitState.workingTreeClean,
    confirmation: process.env.V4_IMPORT_PRODUCTION_CONFIRMATION,
    planHash: plan.planHash,
    expectedCount: plan.expectedCount,
    applicationUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const startedAt = Date.now();
  const { data, error } = await client.rpc("import_question_bank_v4_batch", {
    p_candidates: plan.candidates,
    p_plan_hash: plan.planHash,
    p_expected_count: plan.expectedCount,
    p_source_sha: plan.sourceSha,
  });
  if (error) throw new Error(`V4 batch RPC failed safely: ${error.message}`);
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.status !== "succeeded") {
    throw new Error(`V4 batch rejected: ${result?.error_code ?? "UNKNOWN_SAFE_ERROR"}`);
  }

  const { data: verification, error: verificationError } = await client
    .from("item_bank")
    .select("content_id, status, is_active, approval_status, source_path")
    .eq("bank_version", "v4")
    .order("content_id");
  if (verificationError) throw verificationError;

  const expectedIds = new Set(plan.candidates.map((candidate) => candidate.itemId));
  const rows = verification ?? [];
  const missing = [...expectedIds].filter((itemId) => !rows.some((row) => row.content_id === itemId));
  const importedRows = rows.filter((row) => expectedIds.has(row.content_id));
  const unsafe = importedRows.filter((row) => row.status !== "draft" || row.is_active !== false || row.approval_status !== "approved");
  if (importedRows.length !== plan.candidates.length || missing.length || unsafe.length) {
    throw new Error(`V4 verification failed: imported=${importedRows.length}, missing=${missing.length}, unsafe=${unsafe.length}`);
  }

  console.log(JSON.stringify({
    mode: "apply",
    environment: target.environment,
    projectRef: target.projectRef,
    executionId: result.execution_id,
    candidateCount: plan.candidates.length,
    sourceSha: plan.sourceSha,
    corpusHash: plan.corpusHash,
    planHash: plan.planHash,
    changed: result.changed_count,
    unchanged: result.unchanged_count,
    historicalDeactivated: result.historical_deactivated_count,
    verifiedInactiveRows: importedRows.length,
    durationMs: Date.now() - startedAt,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
