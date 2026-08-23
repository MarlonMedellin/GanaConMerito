import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      errors: ["Direct editorial writes are disabled. Commit canonical content to GitHub and use the governed one-way content sync."],
    },
    { status: 410 },
  );
}
