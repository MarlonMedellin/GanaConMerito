import { after, NextResponse } from "next/server";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import { buildTutorEvidence } from "../../../../lib/tutor/tutor-evidence-builder";
import { DeterministicTutorProvider } from "../../../../lib/tutor/providers/deterministic-tutor-provider";
import { runTutorShadow } from "../../../../lib/tutor/tutor-shadow-runner";
import { persistTutorTurnTrace } from "../../../../lib/tutor/tutor-trace-repository";

const tutor = new DeterministicTutorProvider();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const userMessage = typeof body.message === "string" ? body.message.trim() : "";

    if (!sessionId || !itemId || !userMessage) {
      return NextResponse.json(
        { error: "sessionId, itemId y message son obligatorios" },
        { status: 400 },
      );
    }

    const auth = await requireOwnedSession({ sessionId });
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase, profile } = auth;
    const evidence = await buildTutorEvidence({
      supabase,
      userId: profile.id,
      sessionId,
      itemId,
    });

    const tutorInput = {
      userId: profile.id,
      sessionId,
      itemId,
      message: userMessage,
      evidence,
    };
    const result = await tutor.generate(tutorInput);

    const traceWrite = await persistTutorTurnTrace({
      supabase,
      profileId: profile.id,
      trace: result.trace,
    });

    if (!traceWrite.ok) {
      console.warn("[Tutor Trace Persist Warning]:", traceWrite.error.message);
    }

    after(() => runTutorShadow({ input: tutorInput, deterministic: result }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Tutor API Error]:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud del tutor" },
      { status: 500 },
    );
  }
}
