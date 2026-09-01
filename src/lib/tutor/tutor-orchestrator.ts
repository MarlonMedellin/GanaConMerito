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

    const rationaleQuality = classifyRationale(input.evidence.userSession.userRationale);
    const rawVisibleMessage = this.buildVisibleMessage(input, intent, guardrail.canRevealCorrectAnswer, rationaleQuality);
    const sanitized = enforceNoRevealMessage(rawVisibleMessage, guardrail.canRevealCorrectAnswer);
    const confidence = guardrail.canRevealCorrectAnswer || !requestsCorrectAnswer(input.message) ? 0.82 : 0.68;

    return this.createTurn({
      input,
      traceId,
      createdAt,
      mode,
      intent,
      visibleMessage: sanitized.message,
      degraded: false,
      confidence,
      guardrailsApplied: guardrail.guardrailsApplied,
      evidenceUsed: guardrail.evidenceUsed,
      canRevealCorrectAnswer: guardrail.canRevealCorrectAnswer,
      rationaleQuality: intent === "analyze_user_rationale" || rationaleQuality ? rationaleQuality : undefined,
      suggestedAction: this.suggestAction(intent, guardrail.canRevealCorrectAnswer),
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
    rationaleQuality?: "weak" | "acceptable" | "strong",
  ): string {
    const question = input.evidence.question;
    const session = input.evidence.userSession;
    const maxWords = input.evidence.userSession.selectedOption ? 220 : 120;

    if (!question) return TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE;

    if (requestsCorrectAnswer(input.message) && !canRevealCorrectAnswer) {
      return trimToWordLimit(
        "Todavía no puedo revelar la respuesta correcta. Primero responde la pregunta. Sí puedo ayudarte así: identifica qué pide el enunciado, descarta opciones que no atiendan la competencia evaluada y revisa qué alternativa se sostiene mejor con la información disponible.",
        maxWords,
      );
    }

    if (intent === "give_hint") {
      return trimToWordLimit(
        `Pista: ${question.hint ?? `enfócate en la competencia "${question.competency}" y separa el contexto del enunciado antes de comparar opciones.`} La mejor alternativa debe resolver la tarea esperada: ${question.expectedUserTask}`,
        maxWords,
      );
    }

    if (intent === "compare_options") {
      const options = question.options.map((option) => `${option.key}: revisa si responde directamente al enunciado`).join(" ");
      const suffix = canRevealCorrectAnswer ? ` La clave registrada es ${question.correctOption}: ${question.correctExplanation}` : " Aún no diré cuál es correcta.";
      return trimToWordLimit(`${options}.${suffix}`, maxWords);
    }

    if (intent === "analyze_user_rationale" && session.userRationale && rationaleQuality) {
      const labels = {
        weak: "débil: necesita conectar mejor la opción con el enunciado.",
        acceptable: "aceptable: presenta una razón útil, pero puede contrastar distractores.",
        strong: "fuerte: justifica y contrasta con claridad.",
      };
      return trimToWordLimit(
        `Tu justificación es ${labels[rationaleQuality]} Esta valoración es pedagógica y no cambia el puntaje oficial. ${session.feedback ? `Feedback registrado: ${session.feedback}` : ""} ${canRevealCorrectAnswer ? `La clave registrada es ${question.correctOption} y los distractores deben descartarse porque no sostienen tan bien la tarea esperada.` : ""}`,
        maxWords,
      );
    }

    if (intent === "explain_feedback" && canRevealCorrectAnswer) {
      const selectedExplanation = session.selectedOption
        ? question.explanations?.[session.selectedOption as "A" | "B" | "C" | "D"]
        : undefined;
      return trimToWordLimit(
        `La opción correcta registrada es ${question.correctOption}. ${question.correctExplanation} ${selectedExplanation ? `Sobre tu elección ${session.selectedOption}: ${selectedExplanation}` : ""} ${question.learningNote ? `Aprendizaje transferible: ${question.learningNote}` : ""} ${session.feedback ? `Feedback oficial registrado: ${session.feedback}` : ""} Revisa los distractores frente a la tarea esperada. Esta explicación es pedagógica y no cambia el puntaje oficial ni avanza la sesión.`,
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
    visibleMessage: string;
    evidenceUsed: TutorTurnResponse["evidenceUsed"];
    guardrailsApplied: string[];
    canRevealCorrectAnswer: boolean;
    confidence: number;
    degraded: boolean;
    suggestedAction?: string;
    rationaleQuality?: "weak" | "acceptable" | "strong";
    traceSignals?: TutorTurnResponse["traceSignals"];
  }): TutorTurnResult {
    const sourceTruthRefs = buildSourceTruthRefs(params.input);
    const output: TutorTurnResponse = {
      mode: params.mode,
      intent: params.intent,
      visibleMessage: params.visibleMessage,
      evidenceUsed: params.evidenceUsed,
      sourceTruthRefs,
      guardrailsApplied: [...params.guardrailsApplied, TUTOR_CONTRACT_VERSION],
      canRevealCorrectAnswer: params.canRevealCorrectAnswer,
      confidence: params.confidence,
      degraded: params.degraded,
      suggestedAction: params.suggestedAction,
      rationaleQuality: params.rationaleQuality,
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
