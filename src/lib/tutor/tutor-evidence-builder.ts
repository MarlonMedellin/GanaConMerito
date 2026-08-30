import type { SupabaseClient } from "@supabase/supabase-js";
import { V4QuestionRepository, type V4QuestionSourceRecord } from "../question-bank/v4-question-repository";
import type { QuestionSourceEvidence, SourceTruthStatus, TutorEvidence } from "../../types/tutor-turn";
import { questionTruthToTutorSupportContract, v4QuestionToQuestionTruth } from "../../domain/tutor/question-truth-adapter";
import {
  buildAspirationalProfileTruthV1,
  buildContestTruthV1,
  buildTutorSupportContract,
  enrichQuestionTruthWithNormativeSource,
} from "./normative-source-truth";

interface TutorSessionTurnRecord {
  id: string;
  question_id: string | null;
  selected_option: string | null;
  user_rationale: string | null;
  model_feedback: string | null;
  created_at: string;
}

interface TutorEvaluationEventRecord {
  session_turn_id: string;
  is_correct: boolean | null;
  competency_score: number | null;
}

interface TutorSessionTurnWithEvaluation extends TutorSessionTurnRecord {
  is_correct?: boolean | null;
  competency_score?: number | null;
}

interface TutorLearningProfileRecord {
  target_profile_code: string | null;
}

interface TutorProfessionalProfileRecord {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  area: string | null;
}


interface LearningSignalInput {
  turns: TutorSessionTurnWithEvaluation[];
  currentTurn?: TutorSessionTurnWithEvaluation | null;
  question?: TutorEvidence["question"];
}

function sourceTruthStatusFromVerification(status: string | null): SourceTruthStatus {
  return status === "verified" ? "source_verified" : "synthesized_governed_unverified";
}

function toTutorSourceEvidence(source: V4QuestionSourceRecord): QuestionSourceEvidence {
  return {
    sourceId: source.sourceId,
    reference: source.reference,
    title: source.title ?? undefined,
    sourceType: source.sourceType ?? undefined,
    relationType: source.relationType,
    locator: source.locator ?? undefined,
    sourceTruthStatus: sourceTruthStatusFromVerification(source.verificationStatus),
  };
}

function detectLearningSignals({ turns, currentTurn, question }: LearningSignalInput): TutorEvidence["userSession"]["learningSignals"] | undefined {
  if (!question || !currentTurn?.selected_option) return undefined;

  const selectedOption = currentTurn.selected_option;
  const selected = question.options.find((option) => option.key === selectedOption);
  const likelyDistractor = selectedOption !== question.correctOption;
  const misconceptionDetected = likelyDistractor && Boolean(selected?.rationale && /distractor|intuici|parcial/i.test(selected.rationale));

  const recentSameCompetencyErrors = turns
    .filter((turn) => turn.question_id === question.itemId || Boolean(turn.model_feedback && /competenc|subárea|subarea/i.test(turn.model_feedback ?? "")))
    .filter((turn) => turn.selected_option && turn.is_correct === false).length;

  const repeatedErrorPattern = recentSameCompetencyErrors >= 2 ? `Se observan ${recentSameCompetencyErrors} errores recientes asociados al foco evaluado.` : undefined;
  const weakSubareaSignal = repeatedErrorPattern ? `Refuerzo sugerido en subárea relacionada con ${question.competency}.` : undefined;

  const lowScore = Number(currentTurn.competency_score ?? 0) > 0 && Number(currentTurn.competency_score ?? 0) < 60;
  const highDemand = /analiz|evalu|sintetiz|aplic/i.test(question.cognitiveIntent);
  const difficultyMismatch = lowScore && highDemand
    ? "El patrón de respuesta sugiere brecha entre nivel cognitivo esperado y ejecución observada."
    : undefined;

  const recommendationEvidence = [misconceptionDetected, Boolean(repeatedErrorPattern), Boolean(difficultyMismatch)].filter(Boolean).length;
  const recommendedNextPractice = recommendationEvidence >= 1 && [question.area, question.topic, question.competency].filter(Boolean).length
    ? `Practica un nuevo ítem de ${question.area} (${question.competency}) justificando descarte de distractores antes de responder.`
    : undefined;

  const signalStrength = recommendationEvidence >= 2 ? "strong" : recommendationEvidence === 1 ? "weak" : "insufficient";
  const likelyFalsePositive = misconceptionDetected && !Boolean(repeatedErrorPattern) && !Boolean(difficultyMismatch);
  const evidenceSummary = signalStrength === "strong"
    ? "Se generó señal fuerte con evidencia convergente de historial y ejecución."
    : signalStrength === "weak"
      ? "Se generó señal débil; conviene confirmar con más historial antes de una recomendación fuerte."
      : "No hay evidencia suficiente para una señal fuerte; mantener recomendación conservadora.";

  return {
    misconceptionDetected,
    weakSubareaSignal,
    repeatedErrorPattern,
    recommendedNextPractice,
    difficultyMismatch,
    evidenceSummary,
    recommendationEvidenceCount: recommendationEvidence,
    signalStrength,
    evidenceVsInference: {
      evidence: [
        misconceptionDetected ? "selected_distractor_with_rationale" : "",
        repeatedErrorPattern ? `recent_same_focus_errors:${recentSameCompetencyErrors}` : "",
        difficultyMismatch ? "low_competency_score_on_high_cognitive_demand" : "",
      ].filter(Boolean),
      inferences: [
        weakSubareaSignal ? "weak_subarea_signal" : "",
        difficultyMismatch ? "difficulty_mismatch" : "",
      ].filter(Boolean),
      recommendations: [recommendedNextPractice ?? ""].filter(Boolean),
    },
    likelyFalsePositive,
  };
}

export async function buildTutorEvidence(params: {
  supabase: SupabaseClient;
  userId: string;
  sessionId: string;
  itemId: string;
}): Promise<TutorEvidence> {
  const { supabase, userId, sessionId, itemId } = params;
  const questionBank = new V4QuestionRepository();

  const [practiceQuestion, questionSources, turnsResult, currentTurnResult, learningProfileResult] = await Promise.all([
    questionBank.getPracticeQuestion(itemId),
    questionBank.getQuestionSources(itemId),
    supabase
      .from("session_turns")
      .select("id, question_id, selected_option, user_rationale, model_feedback, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("session_turns")
      .select("id, question_id, selected_option, user_rationale, model_feedback, created_at")
      .eq("session_id", sessionId)
      .eq("question_id", itemId)
      .not("selected_option", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("learning_profiles").select("target_profile_code").eq("profile_id", userId).single(),
  ]);

  const turns = (turnsResult.data ?? []) as TutorSessionTurnRecord[];
  const currentTurnRecord = (currentTurnResult.data ?? null) as TutorSessionTurnRecord | null;
  const learningProfile = learningProfileResult.data as TutorLearningProfileRecord | null;
  const relevantTurnIds = [...new Set([...(turns.map((turn) => turn.id)), ...(currentTurnRecord ? [currentTurnRecord.id] : [])])];
  const evaluationEventsByTurnId = relevantTurnIds.length
    ? await loadEvaluationEventsByTurnId(supabase, relevantTurnIds)
    : new Map<string, TutorEvaluationEventRecord>();
  const turnsWithEvaluation = turns.map((turn) => ({
    ...turn,
    is_correct: evaluationEventsByTurnId.get(turn.id)?.is_correct ?? null,
    competency_score: evaluationEventsByTurnId.get(turn.id)?.competency_score ?? null,
  }));
  const currentTurn = currentTurnRecord
    ? {
        ...currentTurnRecord,
        is_correct: evaluationEventsByTurnId.get(currentTurnRecord.id)?.is_correct ?? null,
        competency_score: evaluationEventsByTurnId.get(currentTurnRecord.id)?.competency_score ?? null,
      }
    : selectAnsweredTurnForItem(turnsWithEvaluation, itemId);

  const professionalProfile = await loadProfessionalProfile(supabase, learningProfile?.target_profile_code);
  const recentPerformanceSummary = buildRecentPerformanceSummary(turnsWithEvaluation);
  const contest = buildContestTruthV1();
  const aspirationalProfile = buildAspirationalProfileTruthV1(professionalProfile);
  const resolvedSources = questionSources.map(toTutorSourceEvidence);
  const decisiveSource = resolvedSources.find((source) => source.relationType === "decisive") ?? resolvedSources[0];
  const answeredQuestion = currentTurn?.selected_option
    ? await questionBank.getAnsweredQuestion(itemId)
    : null;
  const question = practiceQuestion
    ? enrichQuestionTruthWithNormativeSource(
        v4QuestionToQuestionTruth({
          ...practiceQuestion,
          options: practiceQuestion.options.map((option) => ({
            ...option,
            rationale: answeredQuestion?.explanations[option.key],
            isCorrect: answeredQuestion ? option.key === answeredQuestion.correctOption : undefined,
          })),
          sourceId: decisiveSource?.sourceId ?? answeredQuestion?.sourceId ?? practiceQuestion.sourceId,
          sourceReference: decisiveSource?.reference ?? answeredQuestion?.sourceReference ?? practiceQuestion.sourceReference,
          resolvedSources,
          answered: answeredQuestion
            ? {
                correctOption: answeredQuestion.correctOption,
                explanations: answeredQuestion.explanations,
                learningNote: answeredQuestion.learningNote,
              }
            : undefined,
        }),
      )
    : undefined;

  const learningSignals = detectLearningSignals({ turns: turnsWithEvaluation, currentTurn, question });

  return {
    contest,
    aspirationalProfile,
    question,
    tutorSupport: question ? questionTruthToTutorSupportContract(question) : buildTutorSupportContract(question),
    userSession: {
      sessionId,
      userId,
      selectedContestId: contest.contestId,
      selectedProfileId: aspirationalProfile?.profileId ?? "profile-source-missing",
      currentItemId: itemId,
      selectedOption: currentTurn?.selected_option ?? undefined,
      userRationale: currentTurn?.user_rationale ?? undefined,
      feedback: currentTurn?.model_feedback ?? undefined,
      recentPerformanceSummary,
      learningSignals,
    },
  };
}

async function loadEvaluationEventsByTurnId(supabase: SupabaseClient, sessionTurnIds: string[]) {
  const { data } = await supabase
    .from("evaluation_events")
    .select("session_turn_id, is_correct, competency_score")
    .in("session_turn_id", sessionTurnIds);

  const rows = (data ?? []) as TutorEvaluationEventRecord[];
  return new Map(rows.map((row) => [row.session_turn_id, row]));
}

async function loadProfessionalProfile(supabase: SupabaseClient, profileCode?: string | null) {
  if (!profileCode) return null;
  const { data } = await supabase
    .from("target_profiles")
    .select("code, name")
    .eq("code", profileCode)
    .maybeSingle();
  return data ? { ...data, id: data.code, description: null, area: null } as TutorProfessionalProfileRecord : null;
}

function buildRecentPerformanceSummary(turns: TutorSessionTurnWithEvaluation[]): string | undefined {
  if (turns.length === 0) return undefined;
  const answered = turns.filter((turn) => turn.selected_option);
  if (answered.length === 0) return undefined;
  const correct = answered.filter((turn) => turn.is_correct).length;
  const avgScore = answered.reduce((sum, turn) => sum + Number(turn.competency_score ?? 0), 0) / answered.length;
  return `Últimos ${answered.length} intentos registrados: ${correct} correctos; promedio de competencia ${Math.round(avgScore)}.`;
}

export function selectAnsweredTurnForItem(turns: TutorSessionTurnWithEvaluation[], itemId: string) {
  return turns.find((turn) => turn.question_id === itemId && Boolean(turn.selected_option));
}
