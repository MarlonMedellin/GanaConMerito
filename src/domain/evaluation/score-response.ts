import type { EvaluationResult } from "@/types/evaluation";

interface ScoreParams {
  selectedOption?: string;
  correctOption: string;
  responseTimeMs?: number;
  difficulty: number;
  reasoningScore?: number;
  normativeConsistencyScore?: number;
  priorEstimatedLevel?: number;
  userRationale?: string;
}

function inferReasoningScoreFromRationale(userRationale?: string, isCorrect?: boolean) {
  const rationale = userRationale?.trim() ?? "";
  if (!rationale) return isCorrect ? 72 : 38;
  if (rationale.length >= 120) return isCorrect ? 82 : 55;
  if (rationale.length >= 50) return isCorrect ? 78 : 48;
  return isCorrect ? 74 : 42;
}

function buildQualitativeFeedback(input: {
  isCorrect: boolean;
  userRationale?: string;
  remediationNeeded: boolean;
}) {
  if (input.isCorrect && input.userRationale?.trim()) {
    return "Respuesta correcta con justificación registrada. Buen avance.";
  }

  if (input.isCorrect) {
    return "Respuesta correcta. Revisa el fundamento y la regla de decisión.";
  }

  if (input.remediationNeeded && input.userRationale?.trim()) {
    return "La respuesta no fue correcta. Tu justificación ayuda a detectar la premisa a reforzar.";
  }

  return "La respuesta no fue correcta. Examina el fundamento de la clave para reforzar el criterio.";
}

export function scoreResponseBaselineHeuristicV1(
  params: ScoreParams,
): EvaluationResult {
  const isCorrect = params.selectedOption === params.correctOption;

  const reasoningScore =
    params.reasoningScore ?? inferReasoningScoreFromRationale(params.userRationale, isCorrect);
  const normativeConsistencyScore =
    params.normativeConsistencyScore ?? (isCorrect ? 70 : 35);

  const competencyScore =
    reasoningScore * 0.5 + normativeConsistencyScore * 0.2 + (isCorrect ? 30 : 0);

  const estimatedThetaDelta = isCorrect
    ? 0.08 + params.difficulty * 0.05
    : -0.06 - params.difficulty * 0.03;

  const remediationNeeded = !isCorrect && competencyScore < 60;

  return {
    isCorrect,
    reasoningScore,
    normativeConsistencyScore,
    competencyScore,
    estimatedThetaDelta,
    remediationNeeded,
    evaluationSource: "deterministic",
    evaluationVersion: "baseline-heuristic-v1",
    qualitativeFeedback: buildQualitativeFeedback({
      isCorrect,
      userRationale: params.userRationale,
      remediationNeeded,
    }),
  };
}
