import { TUTOR_CONTRACT_VERSION, TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE, hasUserAnswered, validateTutorTurnRequest } from "../../domain/tutor/contract";
import type { TutorIntent, TutorTurnRequest, TutorTurnResponse, TutorTurnResult, TutorTurnTrace } from "../../types/tutor-turn";
import { evaluateTutorGuardrails } from "./tutor-guardrails";
import { classifyRationale, detectTutorIntent, detectTutorMode, enforceNoRevealMessage, requestsCorrectAnswer, trimToWordLimit } from "./tutor-response-policy";

export class TutorOrchestrator {
  public async processTurn(input: TutorTurnRequest): Promise<TutorTurnResult> {
    const traceId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const mode = detectTutorMode(input.message, hasUserAnswered(input.evidence));
    const intent = detectTutorIntent(input.message);

    if (!validateTutorTurnRequest(input)) {
      return this.createTurn({
        input,
        traceId,
        createdAt,
        mode,
        intent,
        visibleMessage: TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE,
        degraded: true,
        confidence: 0.2,
        guardrailsApplied: ["validate_tutor_turn_request", "degrade_on_missing_evidence"],
        evidenceUsed: ["user_session"],
        canRevealCorrectAnswer: false,
      });
    }

    const guardrail = evaluateTutorGuardrails({
      evidence: input.evidence,
      mode,
      intent,
      message: input.message,
    });

    if (guardrail.degraded) {
      return this.createTurn({
        input,
        traceId,
        createdAt,
        mode,
        intent,
        visibleMessage: guardrail.degradationMessage ?? TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE,
        degraded: true,
        confidence: 0.35,
        guardrailsApplied: guardrail.guardrailsApplied,
        evidenceUsed: guardrail.evidenceUsed,
        canRevealCorrectAnswer: guardrail.canRevealCorrectAnswer,
      });
    }

    const profile = input.profile && ["socratic", "direct", "brief"].includes(input.profile) ? input.profile : "socratic";
    const phase: "pre_answer" | "post_answer" = guardrail.canRevealCorrectAnswer ? "post_answer" : "pre_answer";
    const rationaleQuality = classifyRationale(input.evidence.userSession.userRationale);
    const rawVisibleMessage = this.buildVisibleMessage(input, intent, guardrail.canRevealCorrectAnswer, profile, rationaleQuality);
    const sanitized = enforceNoRevealMessage(rawVisibleMessage, guardrail.canRevealCorrectAnswer);
    const confidence = guardrail.canRevealCorrectAnswer || !requestsCorrectAnswer(input.message) ? 0.82 : 0.68;

    const isRedirected = requestsCorrectAnswer(input.message) && !guardrail.canRevealCorrectAnswer;
    const safetyStatus = sanitized.guardrailTriggered ? "blocked" : isRedirected ? "redirected" : "allowed";

    return this.createTurn({
      input,
      traceId,
      createdAt,
      mode,
      intent,
      phase,
      profile,
      visibleMessage: sanitized.message,
      degraded: false,
      confidence,
      guardrailsApplied: guardrail.guardrailsApplied,
      evidenceUsed: guardrail.evidenceUsed,
      canRevealCorrectAnswer: guardrail.canRevealCorrectAnswer,
      rationaleQuality: intent === "analyze_user_rationale" || rationaleQuality ? rationaleQuality : undefined,
      suggestedAction: this.suggestAction(intent, guardrail.canRevealCorrectAnswer),
      safety: { status: safetyStatus, policyVersion: "vNext-1.0" },
      delivery: { fallbackUsed: false },
      traceSignals: {
        dossierAvailable: Boolean(input.evidence.question),
        responseModeUsed: this.mapResponseMode(intent, guardrail.canRevealCorrectAnswer),
        hintLevelUsed: intent === "give_hint" ? this.detectHintLevel(input.message) : undefined,
        misconceptionDetected:
          input.evidence.userSession.learningSignals?.misconceptionDetected ??
          Boolean(input.evidence.userSession.feedback && /error|equivoc|misconcep/i.test(input.evidence.userSession.feedback)),
        weakSubareaSignal: input.evidence.userSession.learningSignals?.weakSubareaSignal,
        repeatedErrorPattern: input.evidence.userSession.learningSignals?.repeatedErrorPattern,
        recommendedNextPractice: input.evidence.userSession.learningSignals?.recommendedNextPractice,
        difficultyMismatch: input.evidence.userSession.learningSignals?.difficultyMismatch,
        evidenceSummary: input.evidence.userSession.learningSignals?.evidenceSummary,
        recommendationEvidenceCount: input.evidence.userSession.learningSignals?.recommendationEvidenceCount,
        signalStrength: input.evidence.userSession.learningSignals?.signalStrength,
        evidenceVsInference: input.evidence.userSession.learningSignals?.evidenceVsInference,
        likelyFalsePositive: input.evidence.userSession.learningSignals?.likelyFalsePositive,
        guardrailTriggered: sanitized.guardrailTriggered || guardrail.guardrailsApplied.length > 0,
        fallbackReason: guardrail.degraded ? guardrail.degradationMessage : undefined,
      },
    });
  }

  private buildVisibleMessage(
    input: TutorTurnRequest,
    intent: TutorIntent,
    canRevealCorrectAnswer: boolean,
    profile: "socratic" | "direct" | "brief" = "socratic",
    rationaleQuality?: "weak" | "acceptable" | "strong",
  ): string {
    const question = input.evidence.question;
    const session = input.evidence.userSession;

    if (!question) return TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE;

    if (requestsCorrectAnswer(input.message) && !canRevealCorrectAnswer) {
      if (profile === "socratic") {
        return trimToWordLimit(
          `El Tutor te ayuda a organizar el análisis sin indicar ni descartar respuestas. No puedo revelar la clave antes de que respondas. Para este ítem de ${question.area}, ¿qué acción responde directamente a la función descrita en el caso? Separa los hechos de las suposiciones y compara las opciones.`,
          110,
        );
      }
      if (profile === "brief") {
        return trimToWordLimit(
          `• No puedo revelar la clave antes de responder.\n• Revisa los hechos del caso en ${question.area}.\n• Compara cuál opción cumple la tarea requerida.`,
          80,
        );
      }
      // direct profile
      return trimToWordLimit(
        `No puedo revelar la clave antes de responder. Analiza los criterios centrales: 1. Competencia en ${question.area}. 2. Coherencia con la tarea requerida. 3. Ajuste factual al enunciado. Comprueba los hechos y descarta opciones no sustentadas.`,
        150,
      );
    }

    if (!canRevealCorrectAnswer) {
      if (profile === "socratic") {
        return trimToWordLimit(
          `Para analizar "${question.area}", ¿cuál es la restricción o deber principal que la norma impone al actor del caso? Examina esa condición antes de ponderar las alternativas.`,
          100,
        );
      }
      if (profile === "brief") {
        return trimToWordLimit(
          `• Revisa el objetivo de ${question.competency}.\n• Separa los hechos del enunciado.\n• Compara las opciones objetivamente.`,
          70,
        );
      }
      return trimToWordLimit(
        `Examina los criterios clave: 1. Competencia del rol en ${question.area}. 2. Coherencia con la tarea esperada. 3. Respeto al debido proceso. Realiza el contraste de opciones sin anticipar la clave.`,
        140,
      );
    }

    // Post-answer responses with profiles
    const maxWords = profile === "brief" ? 110 : profile === "direct" ? 240 : 180;

    if (profile === "brief" && canRevealCorrectAnswer) {
      return trimToWordLimit(
        `• La opción correcta registrada es ${question.correctOption}\n• Criterio: ${question.correctExplanation}\n• Aprendizaje: ${question.learningNote ?? "Aplica este principio a casos similares."}`,
        110,
      );
    }

    if (intent === "give_hint") {
      return trimToWordLimit(
        `Pista: ${question.hint ?? `enfócate en la competencia "${question.competency}" y separa el contexto del enunciado.`} La mejor alternativa responde a: ${question.expectedUserTask}`,
        maxWords,
      );
    }

    if (intent === "compare_options") {
      const options = question.options.map((option) => `${option.key}: revisa su ajuste al enunciado`).join(" ");
      const suffix = canRevealCorrectAnswer ? ` La opción correcta registrada es ${question.correctOption}.` : "";
      return trimToWordLimit(`${options}.${suffix}`, maxWords);
    }

    if (intent === "analyze_user_rationale" && session.userRationale && rationaleQuality) {
      return trimToWordLimit(
        `Justificación evaluada como ${rationaleQuality}. La opción correcta registrada es ${question.correctOption}. Esta valoración es pedagógica y no cambia el puntaje oficial. Revisa los distractores frente a la tarea esperada. ${session.feedback ? `Feedback oficial registrado: ${session.feedback}` : ""}`,
        maxWords,
      );
    }

    if (intent === "explain_feedback" && canRevealCorrectAnswer) {
      const selectedExplanation = session.selectedOption
        ? question.explanations?.[session.selectedOption as "A" | "B" | "C" | "D"]
        : undefined;
      const officialFeedback = session.feedback ? `Feedback oficial registrado: ${session.feedback}` : "Feedback oficial registrado.";
      return trimToWordLimit(
        `La opción correcta registrada es ${question.correctOption}. ${question.correctExplanation} ${selectedExplanation ? `Tu elección (${session.selectedOption}): ${selectedExplanation}` : ""} ${question.learningNote ? `Regla de decisión: ${question.learningNote}` : ""} ${officialFeedback} Revisa los distractores frente a la tarea esperada. Esta explicación es pedagógica y no cambia el puntaje oficial.`,
        maxWords,
      );
    }

    if (intent === "recommend_next_practice") {
      const evidenceLine = session.learningSignals?.evidenceSummary ?? "Sin evidencia suficiente para una recomendación fuerte.";
      const nextPractice =
        session.learningSignals?.recommendedNextPractice ??
        `Practica preguntas de ${question.area} sobre ${question.competency}, explicando por qué descartas cada distractor antes de responder.`;
      const caution = "Esta recomendación es pedagógica y no constituye decisión oficial del concurso.";
      return trimToWordLimit(`${session.recentPerformanceSummary ?? "Aún hay poco historial de desempeño."} ${evidenceLine} Próxima mejor práctica sugerida: ${nextPractice} ${caution}`,300);
    }

    if (intent === "explain_profile_alignment" && input.evidence.aspirationalProfile) {
      const profile = input.evidence.aspirationalProfile;
      return trimToWordLimit(
        `Este perfil apunta a ${profile.jobName}. La pregunta se alinea como práctica de ${question.competency} dentro de ${question.area}; úsala para entrenar lectura del caso, decisión entre alternativas y justificación breve orientada a examen.`,
        maxWords,
      );
    }

    if (intent === "explain_contest_rule" && input.evidence.contest) {
      return trimToWordLimit(
        `${input.evidence.contest.evaluationRulesSummary} No tengo fuente normativa detallada adicional cargada para ampliar reglas específicas sin degradar.`,
        maxWords,
      );
    }

    const answerLine = hasUserAnswered(input.evidence)
      ? `La clave registrada es ${question.correctOption}: ${question.correctExplanation}`
      : "No revelo la clave antes de que respondas.";
    return trimToWordLimit(
      `La pregunta evalúa ${question.competency} en ${question.area}. Tu tarea es: ${question.expectedUserTask} ${answerLine}`,
      maxWords,
    );
  }

  private mapResponseMode(intent: TutorIntent, canRevealCorrectAnswer: boolean): "pre_answer" | "hint_mode" | "post_answer_feedback" | "review_mode" {
    if (intent === "give_hint") return "hint_mode";
    if (canRevealCorrectAnswer && intent === "explain_feedback") return "post_answer_feedback";
    if (canRevealCorrectAnswer) return "review_mode";
    return "pre_answer";
  }

  private detectHintLevel(message: string): 1 | 2 | 3 {
    const normalized = message.toLowerCase();
    if (/nivel\s*3|muy directa|casi respuesta/.test(normalized)) return 3;
    if (/nivel\s*2|mas detalle|más detalle/.test(normalized)) return 2;
    return 1;
  }

  private suggestAction(intent: TutorIntent, canRevealCorrectAnswer: boolean): string | undefined {
    if (intent === "give_hint" || !canRevealCorrectAnswer) return "Responde la pregunta y luego pide explicación de la clave.";
    if (intent === "analyze_user_rationale") return "Reescribe tu justificación contrastando al menos un distractor.";
    return "Revisa el feedback y continúa la práctica desde el botón de sesión.";
  }

  private createTurn(params: {
    input: TutorTurnRequest;
    traceId: string;
    createdAt: string;
    mode: TutorTurnResponse["mode"];
    intent: TutorIntent;
    phase?: "pre_answer" | "post_answer";
    profile?: "socratic" | "direct" | "brief";
    visibleMessage: string;
    evidenceUsed: TutorTurnResponse["evidenceUsed"];
    guardrailsApplied: string[];
    canRevealCorrectAnswer: boolean;
    confidence: number;
    degraded: boolean;
    suggestedAction?: string;
    rationaleQuality?: "weak" | "acceptable" | "strong";
    safety?: { status: "allowed" | "redirected" | "blocked"; policyVersion: string };
    delivery?: { fallbackUsed: boolean };
    traceSignals?: TutorTurnResponse["traceSignals"];
  }): TutorTurnResult {
    const sourceTruthRefs = buildSourceTruthRefs(params.input);
    const output: TutorTurnResponse = {
      mode: params.mode,
      intent: params.intent,
      phase: params.phase ?? (params.canRevealCorrectAnswer ? "post_answer" : "pre_answer"),
      profile: params.profile ?? "socratic",
      visibleMessage: params.visibleMessage,
      evidenceUsed: params.evidenceUsed,
      sourceTruthRefs,
      guardrailsApplied: [...params.guardrailsApplied, TUTOR_CONTRACT_VERSION],
      canRevealCorrectAnswer: params.canRevealCorrectAnswer,
      confidence: params.confidence,
      degraded: params.degraded,
      suggestedAction: params.suggestedAction,
      rationaleQuality: params.rationaleQuality,
      safety: params.safety ?? { status: "allowed", policyVersion: "vNext-1.0" },
      delivery: params.delivery ?? { fallbackUsed: false },
      traceSignals: params.traceSignals,
    };
    const trace: TutorTurnTrace = {
      traceId: params.traceId,
      userId: params.input.userId,
      sessionId: params.input.sessionId,
      itemId: params.input.itemId,
      contestId: params.input.evidence.contest?.contestId,
      profileId: params.input.evidence.aspirationalProfile?.profileId,
      mode: params.mode,
      intent: params.intent,
      evidenceUsed: params.evidenceUsed,
      sourceTruthRefs,
      guardrailsApplied: output.guardrailsApplied,
      canRevealCorrectAnswer: params.canRevealCorrectAnswer,
      degraded: params.degraded,
      confidence: params.confidence,
      rationaleQuality: params.rationaleQuality,
      traceSignals: params.traceSignals,
      createdAt: params.createdAt,
    };

    // La ruta API persiste esta traza mediante persistTutorTurnTrace.
    return { output, trace };
  }
}

function buildSourceTruthRefs(input: TutorTurnRequest): string[] {
  return [
    input.evidence.contest?.sourceTruthVersion,
    input.evidence.aspirationalProfile?.profileId,
    ...(input.evidence.question?.sourceRefs ?? []),
    `session:${input.sessionId}`,
  ].filter((ref): ref is string => Boolean(ref));
}
