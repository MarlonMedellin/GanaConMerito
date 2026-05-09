import { NextResponse } from "next/server";
import { readUpdateJobStatus } from "../../../../../lib/ops/update-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId")?.trim();

  if (!jobId) {
    return NextResponse.json({ error: "jobId es obligatorio." }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  const status = await readUpdateJobStatus(jobId);
  return NextResponse.json(status, { headers: { "cache-control": "no-store" } });
}
