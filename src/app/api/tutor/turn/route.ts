import { after } from "next/server";
import { beginRequestObservation, observedJson } from "@/lib/api/canary-observability";
import { requireOwnedSession } from "@/lib/supabase/guards";
import { buildTutorEvidence } from "@/lib/tutor/tutor-evidence-builder";
import { DeterministicTutorProvider } from "@/lib/tutor/providers/deterministic-tutor-provider";
import { runTutorShadow } from "@/lib/tutor/tutor-shadow-runner";
import { persistTutorTurnTrace } from "@/lib/tutor/tutor-trace-repository";
import { normalizeTutorConversation } from "@/lib/tutor/tutor-conversation";
import { coordinateVisibleTutorTurn } from "@/lib/tutor/tutor-visible-coordinator";
import { isTutorVisibleRequested } from "@/lib/tutor/tutor-candidate-policy";
import { loadTutorBudgetSnapshot } from "@/lib/tutor/tutor-budget";

const tutor = new DeterministicTutorProvider();

export async function POST(request: Request) {
  const observation = beginRequestObservation(request, "/api/tutor/turn");
  let sessionId = "";
  let itemId = "";

  try {
    const body = await request.json();
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    itemId = typeof body.itemId === "string" ? body.itemId : "";
    const conversation = normalizeTutorConversation({ message: body.message, history: body.history });
    const userMessage = conversation.currentMessage;

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
      history: conversation.history,
      evidence,
    };
    const deterministic = await tutor.generate(tutorInput);
    const budget = isTutorVisibleRequested()
      ? await loadTutorBudgetSnapshot({ supabase, profileId: profile.id, sessionId, itemId })
      : undefined;
    const coordinated = await coordinateVisibleTutorTurn({ input: tutorInput, deterministic, budget });
    const result = coordinated.result;
    if (conversation.reasons.length) {
      const traceSignals = {
        ...result.output.traceSignals,
        fallbackReason: result.output.traceSignals?.fallbackReason ?? (conversation.rejected ? "history_normalized" : undefined),
        conversationNormalization: conversation.reasons.join(","),
      };
      result.output.traceSignals = traceSignals as typeof result.output.traceSignals;
      result.trace.traceSignals = traceSignals as typeof result.trace.traceSignals;
    }

    const traceWrite = await persistTutorTurnTrace({
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

    if (coordinated.shouldRunShadow) {
      after(() => runTutorShadow({ input: tutorInput, deterministic: result }));
    }

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
