import { createClient } from "@supabase/supabase-js";
import { buildV4ImportPlan } from "./lib/v4-import-plan";

async function main() {
  const apply = process.argv.includes("--apply");
  const plan = await buildV4ImportPlan(process.cwd());

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      candidateCount: plan.candidates.length,
      planHash: plan.planHash,
      approvedEvidence: {
        legacyRegister: plan.candidates.filter((candidate) => candidate.approvalEvidence.kind === "legacy-register").length,
        expansionBatch: plan.candidates.filter((candidate) => candidate.approvalEvidence.kind === "expansion-batch").length,
      },
      note: "No se modificó Supabase.",
    }, null, 2));
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for --apply.");
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let changed = 0;
  let unchanged = 0;

  for (const candidate of plan.candidates) {
    const { data, error } = await client.rpc("upsert_content_item_v4", {
      p_item: candidate.item,
      p_source_path: candidate.sourcePath,
      p_content_hash: candidate.contentHash,
      p_approval_evidence: candidate.approvalEvidence.reference,
    });
    if (error) throw new Error(`${candidate.itemId}: ${error.message}`);
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.changed) changed += 1;
    else unchanged += 1;
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
  const unsafe = rows.filter((row) => row.status !== "draft" || row.is_active !== false || row.approval_status !== "approved");
  if (rows.length !== plan.candidates.length || missing.length || unsafe.length) {
    throw new Error(`V4 verification failed: rows=${rows.length}, missing=${missing.length}, unsafe=${unsafe.length}`);
  }

  console.log(JSON.stringify({
    mode: "apply",
    candidateCount: plan.candidates.length,
    planHash: plan.planHash,
    changed,
    unchanged,
    verifiedInactiveRows: rows.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
