import { createClient } from "@supabase/supabase-js";
import { buildV4ImportPlan } from "./lib/v4-import-plan";

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
  if (!environment || !["local", "test", "preview", "staging"].includes(environment)) {
    throw new Error("V4_IMPORT_ENVIRONMENT must be local, test, preview, or staging for --apply.");
  }
  if (!url || !serviceRoleKey) {
    throw new Error("Missing isolated V4_IMPORT_SUPABASE_URL or V4_IMPORT_SUPABASE_SERVICE_ROLE_KEY for --apply.");
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && url === process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Refusing to use the application's Supabase URL for this isolated PRD 2 import.");
  }

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
    environment,
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
