import { createUpdateJob } from "../../../../lib/ops/update-jobs";
import { UpdateAction, UPDATE_ACTIONS } from "../../../../lib/ops/web-update";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASSWORD_SHA256 = process.env.GCM_UPDATE_PASSWORD_SHA256;

function isAuthorized(password: string) {
  if (!PASSWORD_SHA256) return false;
  const provided = createHash("sha256").update(password).digest("hex");
  return timingSafeEqual(Buffer.from(provided), Buffer.from(PASSWORD_SHA256));
}

function parseAction(value: unknown): UpdateAction {
  if (typeof value === "string" && UPDATE_ACTIONS.includes(value as UpdateAction)) {
    return value as UpdateAction;
  }
  return "all";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const action = parseAction(body.action);

    if (!password || !isAuthorized(password)) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const job = await createUpdateJob(action);
    return NextResponse.json(
      {
        ok: true,
        accepted: true,
        jobId: job.jobId,
        action: job.action,
        status: job.status,
        message: "Actualización encolada. La ejecución continúa en el worker del host VPS.",
      },
      {
        status: 202,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el job de actualización." },
      { status: 500 },
    );
  }
}
