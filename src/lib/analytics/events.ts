export const PRODUCT_EVENTS = {
  activationStarted: "activation_started",
  activationCompleted: "activation_completed",
  practiceSessionStarted: "practice_session_started",
  practiceQuestionPresented: "practice_question_presented",
  practiceAnswerSubmitted: "practice_answer_submitted",
  practiceAnswerEvaluated: "practice_answer_evaluated",
  tutorTurnRequested: "tutor_turn_requested",
  tutorTurnCompleted: "tutor_turn_completed",
  tutorTurnDegraded: "tutor_turn_degraded",
  errorCaptured: "error_captured",
  latencyCaptured: "latency_captured",
} as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS];

export type ProductEventPayload = {
  event: ProductEventName;
  ts: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  route?: string;
  metadata?: Record<string, unknown>;
};

export function buildProductEvent(
  event: ProductEventName,
  payload: Omit<ProductEventPayload, "event" | "ts">,
): ProductEventPayload {
  return {
    event,
    ts: new Date().toISOString(),
    ...payload,
  };
}

export type CoreBusinessMetrics = {
  activationRate: string;
  answerSubmissionRate: string;
  tutorAssistRate: string;
  completionRate: string;
  degradedTutorRate: string;
  p95TurnLatencyMs: string;
  evaluationErrorRate: string;
};

export const CORE_BUSINESS_METRICS: CoreBusinessMetrics = {
  activationRate: "count(activation_completed) / count(activation_started)",
  answerSubmissionRate: "count(practice_answer_submitted) / count(practice_question_presented)",
  tutorAssistRate: "count(tutor_turn_requested) / count(practice_question_presented)",
  completionRate: "count(practice_answer_evaluated where terminal=true) / count(practice_session_started)",
  degradedTutorRate: "count(tutor_turn_degraded) / count(tutor_turn_completed)",
  p95TurnLatencyMs: "p95(latency_ms where event=latency_captured and op in [evaluation,tutor_turn])",
  evaluationErrorRate: "count(error_captured where area='evaluation') / count(practice_answer_submitted)",
};
