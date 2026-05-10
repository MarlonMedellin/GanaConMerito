import type { SupabaseClient } from "@supabase/supabase-js";
import { applyActiveItemBankFilters, runWithActiveItemBankFallback } from "../supabase/active-item-bank";
import type { TutorEvidence } from "../../types/tutor-turn";
import { normalizeLegacyItemToRichItem } from "../../domain/taxonomy/normalize-item";
import { questionTruthToTutorSupportContract, richItemToQuestionTruth } from "../../domain/tutor/question-truth-adapter";
import {
  buildAspirationalProfileTruthV1,
  buildContestTruthV1,
  buildTutorSupportContract,
  enrichQuestionTruthWithNormativeSource,
} from "./normative-source-truth";

interface TutorItemRecord {
  id: string;
  area: string | null;
  competency: string | null;
  stem: string | null;
  correct_option: string | null;
  explanation: string | null;
  source_type: string | null;
  source_path: string | null;
}

interface TutorOptionRecord {
  option_key: string | null;
  option_text: string | null;
}

interface TutorSessionTurnRecord {
  id: string;
  item_id: string | null;
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
  professional_profile_id: string | null;
}

interface TutorProfessionalProfileRecord {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  area: string | null;
}


interface LearningSignalInput {
  turns: TutorSessionTurnWithEvaluation[];
  currentTurn?: TutorSessionTurnWithEvaluation | null;
  question?: TutorEvidence["question"];
}

function detectLearningSignals({ turns, currentTurn, question }: LearningSignalInput): TutorEvidence["userSession"]["learningSignals"] | undefined {
  if (!question || !currentTurn?.selected_option) return undefined;

  const selectedOption = currentTurn.selected_option;
  const selected = question.options.find((option) => option.key === selectedOption);
  const likelyDistractor = selectedOption !== question.correctOption;
  const misconceptionDetected = likelyDistractor && Boolean(selected?.rationale && /distractor|intuici|parcial/i.test(selected.rationale));

  const recentSameCompetencyErrors = turns
    .filter((turn) => turn.item_id === question.itemId || Boolean(turn.model_feedback && /competenc|subárea|subarea/i.test(turn.model_feedback ?? "")))
    .filter((turn) => turn.selected_option && turn.is_correct === false).length;

  const repeatedErrorPattern = recentSameCompetencyErrors >= 2 ? `Se observan ${recentSameCompetencyErrors} errores recientes asociados al foco evaluado.` : undefined;
  const weakSubareaSignal = repeatedErrorPattern ? `Refuerzo sugerido en subárea relacionada con ${question.competency}.` : undefined;

  const lowScore = Number(currentTurn.competency_score ?? 0) > 0 && Number(currentTurn.competency_score ?? 0) < 60;
  const highDemand = /analiz|evalu|sintetiz|aplic/i.test(question.cognitiveIntent);
  const difficultyMismatch = lowScore && highDemand
    ? "El patrón de respuesta sugiere brecha entre nivel cognitivo esperado y ejecución observada."
    : undefined;

  const recommendedNextPractice = [question.area, question.topic, question.competency].filter(Boolean).length
    ? `Practica un nuevo ítem de ${question.area} (${question.competency}) justificando descarte de distractores antes de responder.`
    : undefined;

  const evidenceSummary = misconceptionDetected || repeatedErrorPattern || difficultyMismatch
    ? "Se generó señal pedagógica trazable con historial reciente y metadata del ítem."
    : "No hay evidencia suficiente para una señal fuerte; mantener recomendación conservadora.";

  return {
    misconceptionDetected,
    weakSubareaSignal,
    repeatedErrorPattern,
    recommendedNextPractice,
    difficultyMismatch,
    evidenceSummary,
  };
}

export async function buildTutorEvidence(params: {
  supabase: SupabaseClient;
  userId: string;
  sessionId: string;
  itemId: string;
}): Promise<TutorEvidence> {
  const { supabase, userId, sessionId, itemId } = params;

  const [itemResult, optionsResult, turnsResult, currentTurnResult, learningProfileResult] = await Promise.all([
    runWithActiveItemBankFallback<TutorItemRecord>((source) =>
      applyActiveItemBankFilters(
        supabase
          .from(source)
          .select("id, area, competency, stem, correct_option, explanation, source_type, source_path")
          .eq("id", itemId),
        source,
      ).single(),
    ),
    supabase.from("item_options").select("option_key, option_text").eq("item_id", itemId).order("option_key", { ascending: true }),
    supabase
      .from("session_turns")
      .select("id, item_id, selected_option, user_rationale, model_feedback, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("session_turns")
      .select("id, item_id, selected_option, user_rationale, model_feedback, created_at")
      .eq("session_id", sessionId)
      .eq("item_id", itemId)
      .not("selected_option", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("learning_profiles").select("professional_profile_id").eq("profile_id", userId).single(),
  ]);

  const item = itemResult.data;
  const options = (optionsResult.data ?? []) as TutorOptionRecord[];
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

  const professionalProfile = await loadProfessionalProfile(supabase, learningProfile?.professional_profile_id);
  const recentPerformanceSummary = buildRecentPerformanceSummary(turnsWithEvaluation);
  const contest = buildContestTruthV1();
  const aspirationalProfile = buildAspirationalProfileTruthV1(professionalProfile);
  const question = item
    ? enrichQuestionTruthWithNormativeSource(
        richItemToQuestionTruth(
          normalizeLegacyItemToRichItem({
            id: item.id,
            area: item.area,
            competency: item.competency,
            stem: item.stem,
            source_type: item.source_type,
            source_path: item.source_path,
          }),
          options
            .filter((option) => option.option_key && option.option_text)
            .map((option) => ({
              key: option.option_key as string,
              text: option.option_text as string,
              rationale: buildOptionRationale(option.option_key as string, item.correct_option),
              isCorrect: currentTurn?.selected_option ? option.option_key === item.correct_option : undefined,
            })),
          item.correct_option ?? "",
          item.explanation ?? "",
        ),
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

async function loadProfessionalProfile(supabase: SupabaseClient, profileId?: string | null) {
  if (!profileId) return null;
  const { data } = await supabase
    .from("professional_profiles")
    .select("id, code, name, description, area")
    .eq("id", profileId)
    .maybeSingle();
  return data as TutorProfessionalProfileRecord | null;
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
  return turns.find((turn) => turn.item_id === itemId && Boolean(turn.selected_option));
}

function buildOptionRationale(optionKey: string, correctOption?: string | null): string {
  if (!correctOption) return "Evalúa si esta alternativa responde al enunciado.";
  return optionKey === correctOption
    ? "Esta alternativa coincide con la clave registrada en la fuente de verdad."
    : "Esta alternativa funciona como distractor frente a la clave registrada.";
}
