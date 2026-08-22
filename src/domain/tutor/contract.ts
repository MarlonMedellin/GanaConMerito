import type { TutorEvidence, TutorTurnRequest } from "../../types/tutor-turn";

export const TUTOR_CONTRACT_VERSION = "tutor-gcm-source-truth-v1";

export const TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE =
  "No tengo evidencia suficiente en la fuente de verdad cargada para responder eso con seguridad. Puedo ayudarte con lo que sí está disponible: la pregunta, tus opciones, tu justificación o el perfil seleccionado.";

export const TUTOR_AUTHORITY_GUARDRAILS = [
  "no_score_mutation",
  "no_session_advance",
  "no_session_close",
  "no_free_chat",
  "no_normative_invention",
];

export function validateTutorTurnRequest(input: TutorTurnRequest): boolean {
  return Boolean(input.userId && input.sessionId && input.itemId && input.message.trim() && input.evidence.userSession);
}

export function hasQuestionEvidence(evidence: TutorEvidence): boolean {
  const question = evidence.question;
  return Boolean(
    question?.itemId &&
      question.stem &&
      question.options.length === 4,
  );
}

export function hasAnsweredQuestionEvidence(evidence: TutorEvidence): boolean {
  return Boolean(hasQuestionEvidence(evidence) && evidence.question?.correctOption && evidence.question.correctExplanation);
}

export function hasContestEvidence(evidence: TutorEvidence): boolean {
  return Boolean(evidence.contest?.contestId && evidence.contest.contestName);
}

export function hasProfileEvidence(evidence: TutorEvidence): boolean {
  return Boolean(evidence.aspirationalProfile?.profileId && evidence.aspirationalProfile.jobName);
}

export function hasUserAnswered(evidence: TutorEvidence): boolean {
  return Boolean(evidence.userSession.selectedOption);
}
