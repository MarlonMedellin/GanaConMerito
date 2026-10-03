import { TUTOR_CONTRACT_VERSION, TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE, hasUserAnswered, validateTutorTurnRequest } from "../../domain/tutor/contract";
import type { QuestionTruthOption, TutorIntent, TutorTurnRequest, TutorTurnResponse, TutorTurnResult, TutorTurnTrace } from "../../types/tutor-turn";
import { evaluateTutorGuardrails } from "./tutor-guardrails";
import { formatTechnicalLabel } from "../ui/format-label";
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
      if (profile === "socratic") return this.buildPreAnswerSocraticMessage(input, intent);
      if (profile === "brief") return this.buildPreAnswerBriefMessage(input, intent);
      return this.buildPreAnswerDirectMessage(input, intent);
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

  private buildPreAnswerDirectMessage(input: TutorTurnRequest, intent: TutorIntent): string {
    const question = input.evidence.question;
    const profile = input.evidence.aspirationalProfile;
    if (!question) return TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE;

    const competency = formatTechnicalLabel(question.competency);
    const area = formatTechnicalLabel(question.area);
    const contextStr = compact(question.stem || question.context || question.expectedUserTask, 120);

    if (intent === "explain_profile_alignment") {
      const roleStr = profile?.jobName ? `rol de ${profile.jobName}` : `tu rol profesional`;
      return trimToWordLimit(
        `Asume el ${roleStr}. La situación evalúa tu capacidad en ${competency} dentro de ${area}. Usa este marco de actuación para interpretar el caso: ${contextStr}.`,
        140
      );
    }
    if (intent === "explain_expected_task") {
      return trimToWordLimit(
        `La tarea evaluativa exige una operación específica frente a este escenario: ${question.expectedUserTask}. Aplica este criterio a la evidencia presentada en: ${contextStr}.`,
        140
      );
    }
    if (intent === "compare_options") {
      const optionSummary = summarizeOptions(question.options);
      return trimToWordLimit(
        `Compara las cuatro alternativas usando dos dimensiones objetivas derivadas del caso: 1. Alineación con ${competency}. 2. Efectividad para resolver la tarea planteada (${question.expectedUserTask}). Opciones: ${optionSummary}. Aplica estos criterios por igual a todas las opciones sin inferir la clave.`,
        140
      );
    }
    if (intent === "give_hint") {
      return trimToWordLimit(
        `Pista: ${question.hint ?? `Enfócate en la tarea: ${question.expectedUserTask}`}. Usa el contexto (${contextStr}) para tomar la decisión.`,
        100
      );
    }
    return trimToWordLimit(
      `Examina los criterios clave: Competencia en ${competency}. Tarea: ${question.expectedUserTask}. Compara las opciones objetivamente.`,
      140
    );
  }

  private buildPreAnswerBriefMessage(input: TutorTurnRequest, intent: TutorIntent): string {
    const question = input.evidence.question;
    const profile = input.evidence.aspirationalProfile;
    if (!question) return TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE;

    const competency = formatTechnicalLabel(question.competency);

    if (intent === "explain_profile_alignment") {
      const roleStr = profile?.jobName || "tu rol";
      return trimToWordLimit(
        `• Perspectiva: ${roleStr}.
• Competencia: ${competency}.
• Foco: Interpreta el caso desde este marco de actuación.`,
        80
      );
    }
    if (intent === "explain_expected_task") {
      return trimToWordLimit(
        `• Operación cognitiva: ${question.expectedUserTask}.
• Foco: Responde exactamente a la demanda del caso.
• Acción: Analiza la evidencia provista.`,
        80
      );
    }
    if (intent === "compare_options") {
      return trimToWordLimit(
        `• Dimensión 1: Cumplimiento de ${competency}.
• Dimensión 2: Ajuste a ${question.expectedUserTask}.
• Acción: Evalúa A, B, C y D bajo ambas dimensiones.`,
        80
      );
    }
    if (intent === "give_hint") {
      return trimToWordLimit(`• Pista: ${question.hint ?? `Atiende a ${question.expectedUserTask}`}.`, 80);
    }
    return trimToWordLimit(
      `• Competencia: ${competency}.
• Tarea: ${question.expectedUserTask}.
• Compara objetivamente.`,
      80
    );
  }

  private buildPreAnswerSocraticMessage(input: TutorTurnRequest, intent: TutorIntent): string {
    const question = input.evidence.question;
    const profile = input.evidence.aspirationalProfile;
    if (!question) return TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE;

    const competency = formatTechnicalLabel(question.competency);
    const area = formatTechnicalLabel(question.area);
    const contextStr = compact(question.stem || question.context || question.expectedUserTask, 170);

    const roleStr = profile?.jobName ? `el rol de ${profile.jobName}` : `tu rol`;
    const optionSummary = summarizeOptions(question.options);

    if (intent === "explain_profile_alignment") {
      return trimToWordLimit(
        `Antes de mirar las opciones, ubícate en ${roleStr}. ¿Qué responsabilidades te exige la competencia de ${competency} frente a una situación como esta: "${contextStr}"?`,
        120
      );
    }

    if (intent === "explain_expected_task") {
      return trimToWordLimit(
        `¿Qué operación específica te exige el caso? Contrástalo con la expectativa: ${question.expectedUserTask}. Pregúntate qué elemento del contexto (${contextStr}) determina la decisión.`,
        120
      );
    }

    if (intent === "compare_options") {
      return trimToWordLimit(
        `Compara las cuatro alternativas bajo una misma lente: ¿En qué medida cada opción responde a ${question.expectedUserTask} y demuestra ${competency}? Opciones: ${optionSummary}. Aplica este contraste por igual sin adelantar conclusiones.`,
        135
      );
    }

    if (intent === "give_hint") {
      return trimToWordLimit(
        `Pista inicial: ${question.hint ?? `En "${area}", busca qué criterio organiza la decisión.`} Luego compara ese criterio con las alternativas sin descartes apresurados.`,
        100
      );
    }

    return trimToWordLimit(
      `Para analizar el caso, conecta ${competency} con: ${contextStr}. Después revisa las opciones (${optionSummary}) y pregunta cuál cumple mejor la tarea.`,
      120
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

function summarizeOptions(options: QuestionTruthOption[] = []): string {
  return options
    .map((option) => `${option.key}: ${compact(option.text, 80)}`)
    .join(" | ");
}

function compact(value: string | undefined, maxLength: number): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}
