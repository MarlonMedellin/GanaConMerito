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
import { defaultAttemptStore } from "@/domain/session/attempt-service";
import type { PracticeMode } from "@/types/session";

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
    const requestedProfile = typeof body.profile === "string" && ["socratic", "direct", "brief"].includes(body.profile)
      ? (body.profile as "socratic" | "direct" | "brief")
      : "socratic";
    const attemptId = typeof body.attemptId === "string" ? body.attemptId : undefined;
    const clientTurnId = typeof body.clientTurnId === "string" ? body.clientTurnId : undefined;
    const mode = typeof body.mode === "string" ? body.mode : "guided";

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

    // Validate authoritative attempt if attemptId provided or query latest
    let attemptRecord = attemptId
      ? await defaultAttemptStore.getAttempt(attemptId)
      : await defaultAttemptStore.getLatestAttemptForSessionItem(sessionId, itemId);

    if (attemptId && !attemptRecord) {
      return observedJson(observation, { error: "Attempt not found" }, { status: 400, event: "canary.tutor.attempt_not_found", sessionId, itemId });
    }

    if (attemptRecord) {
      if (attemptRecord.sessionId !== sessionId || attemptRecord.itemId !== itemId || attemptRecord.profileId !== profile.id) {
        return observedJson(observation, { error: "Attempt ownership mismatch" }, { status: 403, event: "canary.tutor.attempt_mismatch", sessionId, itemId });
      }
      if (attemptRecord.phase === "expired") {
        return observedJson(observation, { error: "Attempt has expired" }, { status: 400, event: "canary.tutor.attempt_expired", sessionId, itemId });
      }
    }

    const effectiveMode: PracticeMode = attemptRecord?.mode ?? (mode === "simulation" || mode === "review" ? mode : "guided");

    const evidence = await buildTutorEvidence({
      supabase,
      userId: profile.id,
      sessionId,
      itemId,
    });

    const isAnswered = Boolean(evidence.userSession.selectedOption) || attemptRecord?.phase === "submitted";
    if (effectiveMode === "simulation" && !isAnswered) {
      return observedJson(
        observation,
        {
          output: {
            mode: "pre_answer",
            intent: "clarify_concept",
            phase: "pre_answer",
            profile: requestedProfile,
            visibleMessage: "El Tutor antes de responder está deshabilitado en modo Simulación. Se activará después de contestar el reactivo.",
            evidenceUsed: ["user_session"],
            sourceTruthRefs: [],
            guardrailsApplied: ["simulation_mode_pre_answer_disabled"],
            canRevealCorrectAnswer: false,
            confidence: 1.0,
            degraded: true,
            safety: { status: "blocked", policyVersion: "vNext-1.0" },
            delivery: { fallbackUsed: true },
          },
          trace: {
            traceId: crypto.randomUUID(),
            userId: profile.id,
            sessionId,
            itemId,
            mode: "pre_answer",
            intent: "clarify_concept",
            evidenceUsed: ["user_session"],
            sourceTruthRefs: [],
            guardrailsApplied: ["simulation_mode_pre_answer_disabled"],
            canRevealCorrectAnswer: false,
            degraded: true,
            confidence: 1.0,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 200, event: "canary.tutor.simulation_blocked", sessionId, itemId },
      );
    }

    // Mark assistance used on pre-answer turn
    if (attemptRecord && !isAnswered) {
      await defaultAttemptStore.markAssistanceUsed(attemptRecord.attemptId);
    }

    const tutorInput = {
      userId: profile.id,
      sessionId,
      itemId,
      attemptId: attemptRecord?.attemptId ?? attemptId,
      clientTurnId,
      profile: requestedProfile,
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
