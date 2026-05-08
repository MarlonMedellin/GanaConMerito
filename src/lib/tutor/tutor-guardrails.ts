import {
  TUTOR_AUTHORITY_GUARDRAILS,
  TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE,
  hasContestEvidence,
  hasProfileEvidence,
  hasQuestionEvidence,
  hasUserAnswered,
} from "../../domain/tutor/contract";
import type { TutorEvidence, TutorEvidenceKey, TutorIntent, TutorMode } from "../../types/tutor-turn";
import { requestsCorrectAnswer } from "./tutor-response-policy";

export interface TutorGuardrailDecision {
  degraded: boolean;
  canRevealCorrectAnswer: boolean;
  guardrailsApplied: string[];
  evidenceUsed: TutorEvidenceKey[];
  degradationMessage?: string;
}

export function evaluateTutorGuardrails(params: {
  evidence: TutorEvidence;
  mode: TutorMode;
  intent: TutorIntent;
  message: string;
}): TutorGuardrailDecision {
  const guardrailsApplied = [...TUTOR_AUTHORITY_GUARDRAILS];
  const evidenceUsed = getEvidenceUsed(params.evidence, params.mode, params.intent);
  const canRevealCorrectAnswer = hasUserAnswered(params.evidence);

  if (requestsCorrectAnswer(params.message) && !canRevealCorrectAnswer) {
    guardrailsApplied.push("no_correct_answer_before_user_answer");
  }

  const hasRequiredEvidence = hasEvidenceForIntent(params.evidence, params.mode, params.intent);
  if (!hasRequiredEvidence) {
    guardrailsApplied.push("degrade_on_missing_evidence");
    return {
      degraded: true,
      canRevealCorrectAnswer,
      guardrailsApplied,
      evidenceUsed,
      degradationMessage: TUTOR_INSUFFICIENT_EVIDENCE_MESSAGE,
    };
  }

  return {
    degraded: false,
    canRevealCorrectAnswer,
    guardrailsApplied,
    evidenceUsed,
  };
}

function hasEvidenceForIntent(evidence: TutorEvidence, mode: TutorMode, intent: TutorIntent): boolean {
  if (mode === "performance_analysis") return Boolean(evidence.userSession.recentPerformanceSummary);
  if (intent === "explain_profile_alignment") return hasProfileEvidence(evidence);
  if (intent === "explain_contest_rule") return hasContestEvidence(evidence);
  return hasQuestionEvidence(evidence);
}

function getEvidenceUsed(evidence: TutorEvidence, mode: TutorMode, intent: TutorIntent): TutorEvidenceKey[] {
  const used = new Set<TutorEvidenceKey>(["user_session"]);
  const questionModes: TutorMode[] = ["current_question", "pre_answer", "hint_mode", "post_answer_feedback", "review_mode"];
  if (hasQuestionEvidence(evidence) && questionModes.includes(mode)) used.add("question");
  if (hasContestEvidence(evidence) && (mode === "contest_preparation" || intent === "explain_contest_rule")) used.add("contest");
  if (hasProfileEvidence(evidence) && (mode === "contest_preparation" || intent === "explain_profile_alignment")) {
    used.add("aspirational_profile");
  }
  if (evidence.userSession.recentPerformanceSummary && mode === "performance_analysis") used.add("recent_performance");
  return [...used];
}
