import { runWebUpdate } from "../../../../lib/ops/web-update";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 900;

const PASSWORD_SHA256 = "ad13a3519ee150c4416839fe5b0d55c1f11575bd85b0f413fa695a5390e58365";

function isAuthorized(password: string) {
  const provided = createHash("sha256").update(password).digest("hex");
  return timingSafeEqual(Buffer.from(provided), Buffer.from(PASSWORD_SHA256));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!password || !isAuthorized(password)) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const report = await runWebUpdate();
    return NextResponse.json(report, {
      status: report.ok ? 200 : 500,
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo ejecutar la actualización.",
      },
      { status: 500 },
    );
  }
}
