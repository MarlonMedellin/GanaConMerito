import { NextResponse } from "next/server";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import { buildTutorTraceSummary, type TutorTraceSummaryRow } from "@/lib/tutor/tutor-trace-summary";

const TRACE_PAGE_SIZE = 500;

export async function GET() {
  const auth = await requireAuthenticatedProfile();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, profile } = auth;
  const summaryRows: TutorTraceSummaryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("tutor_turn_traces")
      .select("created_at, mode, intent, degraded, can_reveal_correct_answer, guardrails_applied")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .range(from, from + TRACE_PAGE_SIZE - 1);

    if (error) {
      console.error("[Tutor Trace Summary Error]:", error);
      return NextResponse.json({ error: "No fue posible obtener el resumen de trazas" }, { status: 500 });
    }

    const rows = (data ?? []) as TutorTraceSummaryRow[];
    summaryRows.push(...rows);

    if (rows.length < TRACE_PAGE_SIZE) {
      break;
    }

    from += TRACE_PAGE_SIZE;
  }

  return NextResponse.json(buildTutorTraceSummary(summaryRows), { status: 200 });
}
