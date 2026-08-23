import { after, NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { getRequestIdHeaderName } from "@/lib/api/request-id";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import { buildTutorEvidence } from "../../../../lib/tutor/tutor-evidence-builder";
import { DeterministicTutorProvider } from "../../../../lib/tutor/providers/deterministic-tutor-provider";
import { runTutorShadow } from "../../../../lib/tutor/tutor-shadow-runner";
import { persistTutorTurnTrace } from "../../../../lib/tutor/tutor-trace-repository";

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
      logRequestOutcome(observation, {
        event: "canary.tutor.invalid_body",
        status: 400,
        errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
        sessionId,
        itemId,
      });
      return jsonWithRequestId(
        { error: "sessionId, itemId y message son obligatorios" },
        400,
        observation,
      );
    }

    const auth = await requireOwnedSession({ sessionId });
    if (!auth.ok) {
      logRequestOutcome(observation, {
        event: "canary.tutor.auth_or_ownership_failed",
        status: auth.status,
        errorCode: auth.status === 401 ? API_ERROR_CODES.AUTH_UNAUTHORIZED : API_ERROR_CODES.SESSION_NOT_FOUND,
        sessionId,
        itemId,
      });
      return jsonWithRequestId({ error: auth.error }, auth.status, observation);
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

    after(() => runTutorShadow({ input: tutorInput, deterministic: result }));

    logRequestOutcome(observation, {
      event: "canary.tutor.completed",
      status: 200,
      sessionId,
      itemId,
      extra: {
        degraded: result.trace.degraded,
        tracePersisted: traceWrite.ok,
        intent: result.trace.intent,
      },
    });
    const response = NextResponse.json(result, { status: 200 });
    response.headers.set(getRequestIdHeaderName(), observation.requestId);
    return response;
  } catch (error) {
    logRequestOutcome(observation, {
      event: "canary.tutor.failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
      sessionId,
      itemId,
      error,
    });
    return jsonWithRequestId(
      { error: "Error al procesar la solicitud del tutor" },
      500,
      observation,
    );
  }
}
