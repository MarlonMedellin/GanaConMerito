import { after } from "next/server";
import { beginRequestObservation, observedJson } from "@/lib/api/canary-observability";
import { requireOwnedSession } from "@/lib/supabase/guards";
import { buildTutorEvidence } from "@/lib/tutor/tutor-evidence-builder";
import { DeterministicTutorProvider } from "@/lib/tutor/providers/deterministic-tutor-provider";
import { runTutorShadow } from "@/lib/tutor/tutor-shadow-runner";
import { persistTutorTurnTrace } from "@/lib/tutor/tutor-trace-repository";

const tutor = new DeterministicTutorProvider();

export async function POST(request: Request) {
  const observation = beginRequestObservation(request, "/api/tutor/turn");
  let sessionId = "";
  let itemId = "";

  try {
    const body = await request.json();
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    itemId = typeof body.itemId === "string" ? body.itemId : "";
    const userMessage = typeof body.message === "string" ? body.message.trim() : "";

    if (!sessionId || !itemId || !userMessage) {
      return observedJson(observation, { error: "sessionId, itemId y message son obligatorios" }, {
        status: 400,
        event: "canary.tutor.invalid_request",
        errorCode: "TUTOR_INVALID_REQUEST",
        sessionId,
        itemId,
      });
    }

    const auth = await requireOwnedSession({ sessionId });
    if (!auth.ok) {
      return observedJson(observation, { error: auth.error }, {
        status: auth.status,
        event: "canary.tutor.session_not_owned",
        errorCode: auth.status === 401 ? "AUTH_UNAUTHORIZED" : "SESSION_NOT_FOUND",
        sessionId,
        itemId,
      });
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
      console.warn(JSON.stringify({
        event: "canary.tutor.trace_persist_warning",
        requestId: observation.requestId,
        route: observation.route,
        errorCode: traceWrite.error.code ?? "TRACE_WRITE_FAILED",
      }));
    }

    after(() => runTutorShadow({ input: tutorInput, deterministic: result }));

    return observedJson(observation, result, {
      status: 200,
      event: "canary.tutor.turn_completed",
      sessionId,
      itemId,
    });
  } catch {
    return observedJson(observation, { error: "Error al procesar la solicitud del tutor" }, {
      status: 500,
      event: "canary.tutor.turn_failed",
      errorCode: "TUTOR_TURN_FAILED",
      sessionId,
      itemId,
    });
  }
}
