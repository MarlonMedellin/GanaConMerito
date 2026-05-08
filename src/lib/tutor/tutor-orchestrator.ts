import { TUTOR_CONTRACT_VERSION, TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE, hasUserAnswered, validateTutorTurnRequest } from "../../domain/tutor/contract";
import type { TutorIntent, TutorTurnRequest, TutorTurnResponse, TutorTurnResult, TutorTurnTrace } from "../../types/tutor-turn";
import { evaluateTutorGuardrails } from "./tutor-guardrails";
import { classifyRationale, detectHintLevel, detectTutorIntent, detectTutorMode, requestsCorrectAnswer, trimToWordLimit } from "./tutor-response-policy";

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
    const visibleMessage = this.buildVisibleMessage(input, intent, guardrail.canRevealCorrectAnswer, rationaleQuality);
    const confidence = guardrail.canRevealCorrectAnswer || !requestsCorrectAnswer(input.message) ? 0.82 : 0.68;

    return this.createTurn({
      input,
      traceId,
      createdAt,
      mode,
      intent,
      visibleMessage,
      degraded: false,
      confidence,
      guardrailsApplied: guardrail.guardrailsApplied,
      evidenceUsed: guardrail.evidenceUsed,
      canRevealCorrectAnswer: guardrail.canRevealCorrectAnswer,
      rationaleQuality: intent === "analyze_user_rationale" || rationaleQuality ? rationaleQuality : undefined,
      suggestedAction: this.suggestAction(intent, guardrail.canRevealCorrectAnswer),
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
      const level = detectHintLevel(input.message);
      const ladder = {
        1: `Pista nivel 1: identifica exactamente qué tarea exige el caso (${question.expectedUserTask}) y evita decidir por intuición.`,
        2: `Pista nivel 2: conecta la competencia "${question.competency}" con señales del caso y descarta opciones que no cumplan esa tarea.`,
        3: `Pista nivel 3: usa el razonamiento normativo (${question.normativeReasoning ?? "aplica criterio de coherencia técnica"}) y compara por qué una opción se sostiene mejor que los distractores, sin buscar letra.`
      } as const;
      return trimToWordLimit(ladder[level], maxWords);
    }

    if (intent === "compare_options") {
      const options = question.options.map((option) => `${option.key}: revisa si responde directamente al enunciado`).join(" ");
      const suffix = " Prioriza justificar por qué una opción satisface mejor la tarea esperada, sin enfocarte en letra.";
      return trimToWordLimit(`${options}.${suffix}`, maxWords);
    }

    if (intent === "analyze_user_rationale" && session.userRationale && rationaleQuality) {
      const misconception = question.misconceptionMap?.find((entry) => session.userRationale?.toLowerCase().includes(entry.pattern.toLowerCase()));
      const misconceptionLine = misconception ? ` Posible misconception detectada: ${misconception.feedback}` : "";
      const labels = {
        weak: "débil: necesita conectar mejor la opción con el enunciado.",
        acceptable: "aceptable: presenta una razón útil, pero puede contrastar distractores.",
        strong: "fuerte: justifica y contrasta con claridad.",
      };
      return trimToWordLimit(
        `Tu justificación es ${labels[rationaleQuality]} Esta valoración es pedagógica y no cambia el puntaje oficial. ${session.feedback ? `Feedback registrado: ${session.feedback}` : ""} ${canRevealCorrectAnswer ? `Usa la justificación canónica (${question.canonicalRationale ?? question.correctExplanation}) para revisar por qué tu razonamiento mejora, sin centrarte en letra.` : ""}${misconceptionLine}`,
        maxWords,
      );
    }

    if (intent === "explain_feedback" && canRevealCorrectAnswer) {
      return trimToWordLimit(
        `${session.feedback ? `Feedback oficial registrado: ${session.feedback}.` : ""} Revisa por qué tu elección (${session.selectedOption ?? "sin opción registrada"}) se alinea o no con la tarea esperada. Contrasta distractores con el razonamiento canónico: ${question.canonicalRationale ?? question.correctExplanation}. Esta explicación es pedagógica y no cambia el puntaje oficial ni avanza la sesión.`,
        maxWords,
      );
    }

    if (intent === "recommend_next_practice") {
      return trimToWordLimit(
        `${session.recentPerformanceSummary ?? "Aún hay poco historial de desempeño."} Próximo foco sugerido: practica preguntas de ${question.area} sobre ${question.competency}, explicando por qué descartas cada distractor antes de responder.`,
        300,
      );
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
      ? `Ya respondiste: analiza tu decisión con el razonamiento canónico (${question.canonicalRationale ?? question.correctExplanation}).`
      : "No revelo la clave antes de que respondas.";
    return trimToWordLimit(
      `La pregunta evalúa ${question.competency} en ${question.area}. Tu tarea es: ${question.expectedUserTask} ${answerLine}`,
      maxWords,
    );
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
      createdAt: params.createdAt,
    };

    // TODO: Persist TutorTurnTrace when a governed tutor telemetry table exists.
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
