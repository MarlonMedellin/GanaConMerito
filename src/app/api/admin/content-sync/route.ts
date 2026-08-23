import { NextResponse } from "next/server";
import { buildContentSyncPlan, summarizeContentSyncPlan } from "../../../../../scripts/lib/content-sync-plan";
import { applyContentSyncPlan, diffContentSyncPlan, readContentSyncStatus, readContentSyncTarget, verifyContentSyncPlan } from "../../../../../scripts/lib/content-sync-database";
import { assertContentSyncTarget } from "../../../../../scripts/lib/content-sync-guard";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { requireAdminProfile } from "../../../../lib/supabase/guards";

const MODES = new Set(["validate", "plan", "diff", "apply", "verify", "status"]);

export async function POST(request: Request) {
  const auth = await requireAdminProfile();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const mode = typeof body.mode === "string" && MODES.has(body.mode) ? body.mode : null;
    if (!mode) return NextResponse.json({ error: "Invalid content sync mode" }, { status: 400 });

    const plan = await buildContentSyncPlan(process.cwd());
    const summary = summarizeContentSyncPlan(plan);
    if (mode === "validate" || mode === "plan") {
      return NextResponse.json({ mode, valid: true, ...summary });
    }

    const admin = getSupabaseAdminClient();
    const target = await readContentSyncTarget(admin);
    if (mode === "status") {
      return NextResponse.json({ mode, repository: summary, database: await readContentSyncStatus(admin) });
    }
    const diff = await diffContentSyncPlan(admin, plan);
    if (mode === "diff") return NextResponse.json({ mode, ...summary, target, diff });
    if (mode === "verify") {
      const verification = await verifyContentSyncPlan(admin, summary.planHash);
      return NextResponse.json({ mode, ...summary, target, diff, verification }, { status: verification?.ok && diff.changed === 0 ? 200 : 409 });
    }

    const url = process.env.CONTENT_SYNC_SUPABASE_URL;
    if (!url || url !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Administrative sync target must match the server-authorized Supabase URL");
    }
    const guard = assertContentSyncTarget({
      environment: process.env.CONTENT_SYNC_ENVIRONMENT,
      url,
      plan,
      planHash: summary.planHash,
      approvedPlanHash: typeof body.approvedPlanHash === "string" ? body.approvedPlanHash : undefined,
      databaseBaselineId: target.baselineId,
      databaseInstanceId: target.instanceId,
      requestedInstanceId: typeof body.targetInstanceId === "string" ? body.targetInstanceId : undefined,
      repoRoot: process.cwd(),
    });
    const result = await applyContentSyncPlan(admin, {
      plan,
      planHash: summary.planHash,
      approvedPlanHash: body.approvedPlanHash,
      actor: `profile:${auth.profile.id}`,
      mechanism: "admin-api",
      targetInstanceId: target.instanceId,
    });
    const after = await diffContentSyncPlan(admin, plan);
    return NextResponse.json({ mode, ...summary, target: guard, before: diff, result, after }, { status: after.changed === 0 ? 200 : 409 });
  } catch (error) {
    console.error("Content sync admin API failed safely", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Content sync failed safely" }, { status: 409 });
  }
}
