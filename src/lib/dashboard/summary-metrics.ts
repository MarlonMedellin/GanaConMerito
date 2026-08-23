import type { DashboardSummaryMetrics, MetricSignalLevel } from "@/types/evaluation";

export interface DashboardTopicBreakdownRow {
  area: string;
  competency: string;
  attempts: number;
  correct_count: number;
  avg_reasoning_score: number;
  avg_difficulty: number;
  estimated_level: number;
  percentile_segment?: number | null;
  updated_at?: string | null;
}

const MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION = 3;
const MIN_ATTEMPTS_FOR_STRONG_CONCLUSION = 5;
const MIN_ACCURACY_FOR_STRENGTH = 0.6;
const MAX_ACCURACY_FOR_WEAKNESS = 0.5;

function getSignalLevel(totalAttempts: number): MetricSignalLevel {
  if (totalAttempts <= 0) return "no_signal";
  if (totalAttempts <= 2) return "low_signal";
  if (totalAttempts <= 4) return "emerging_signal";
  return "usable_signal";
}

function getSignalCopy(signalLevel: MetricSignalLevel) {
  switch (signalLevel) {
    case "no_signal":
      return {
        signalLabel: "Sin señal",
        signalDescription: "Todavía no hay intentos suficientes para interpretar progreso o prioridades.",
        recommendedAction: "Empieza con algunas respuestas más antes de sacar conclusiones.",
      };
    case "low_signal":
      return {
        signalLabel: "Señal inicial",
        signalDescription: "Ya hay actividad, pero la muestra sigue siendo demasiado corta para conclusiones firmes.",
        recommendedAction: "Suma más intentos comparables antes de priorizar fortalezas o refuerzos.",
      };
    case "emerging_signal":
      return {
        signalLabel: "Señal emergente",
        signalDescription: "Empiezan a aparecer patrones útiles, aunque todavía conviene leerlos con prudencia.",
        recommendedAction: "Usa esta lectura para orientar práctica, pero confirma con más evidencia.",
      };
    case "usable_signal":
      return {
        signalLabel: "Señal usable",
        signalDescription: "Hay una muestra útil para orientar la práctica, sin equivaler a una medición psicométrica calibrada.",
        recommendedAction: "Prioriza focos preliminares y confirma los patrones con más práctica comparable.",
      };
  }
}

export function emptyDashboardSummaryMetrics(): DashboardSummaryMetrics {
  const signal = getSignalCopy("no_signal");
  return {
    estimatedLevel: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    avgReasoningScore: 0,
    strongestCompetencies: [],
    weakestCompetencies: [],
    recentTrend: "stable",
    signalLevel: "no_signal",
    signalLabel: signal.signalLabel,
    signalDescription: signal.signalDescription,
    canShowStrongConclusion: false,
    canShowTrend: false,
    canShowPercentile: false,
    recommendedAction: signal.recommendedAction,
  };
}

export function getDashboardAccuracy(row: Pick<DashboardTopicBreakdownRow, "attempts" | "correct_count">) {
  return row.attempts > 0 ? row.correct_count / row.attempts : 0;
}

function dedupeCompetencies(rows: DashboardTopicBreakdownRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.competency || seen.has(row.competency)) return false;
    seen.add(row.competency);
    return true;
  });
}

export function buildDashboardSummaryMetrics(stats: DashboardTopicBreakdownRow[]): DashboardSummaryMetrics {
  const totalAttempts = stats.reduce((sum, row) => sum + row.attempts, 0);
  const totalCorrect = stats.reduce((sum, row) => sum + row.correct_count, 0);
  const signalLevel = getSignalLevel(totalAttempts);
  const signalCopy = getSignalCopy(signalLevel);
  const canShowStrongConclusion = totalAttempts >= MIN_ATTEMPTS_FOR_STRONG_CONCLUSION;
  const avgReasoningScore =
    totalAttempts > 0
      ? Number(
          (
            stats.reduce((sum, row) => sum + Number(row.avg_reasoning_score) * row.attempts, 0) /
            totalAttempts
          ).toFixed(2),
        )
      : 0;
  const estimatedLevel =
    stats.length > 0
      ? Number((stats.reduce((sum, row) => sum + Number(row.estimated_level), 0) / stats.length).toFixed(3))
      : 0;

  const strongestCompetencies = dedupeCompetencies(
    [...stats]
      .filter(
        (row) =>
          row.attempts >= MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION &&
          row.correct_count > 0 &&
          Number(row.estimated_level) > 0 &&
          getDashboardAccuracy(row) >= MIN_ACCURACY_FOR_STRENGTH,
      )
      .sort((a, b) => {
        const levelDiff = Number(b.estimated_level) - Number(a.estimated_level);
        if (levelDiff !== 0) return levelDiff;
        const accuracyDiff = getDashboardAccuracy(b) - getDashboardAccuracy(a);
        if (accuracyDiff !== 0) return accuracyDiff;
        return b.attempts - a.attempts;
      }),
  )
    .map((row) => row.competency)
    .slice(0, 3);

  const strongestSet = new Set(strongestCompetencies);
  const weakestCompetencies = dedupeCompetencies(
    [...stats]
      .filter(
        (row) =>
          row.attempts >= MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION &&
          !strongestSet.has(row.competency) &&
          (getDashboardAccuracy(row) < MAX_ACCURACY_FOR_WEAKNESS || Number(row.estimated_level) < 0),
      )
      .sort((a, b) => {
        const accuracyDiff = getDashboardAccuracy(a) - getDashboardAccuracy(b);
        if (accuracyDiff !== 0) return accuracyDiff;
        const levelDiff = Number(a.estimated_level) - Number(b.estimated_level);
        if (levelDiff !== 0) return levelDiff;
        return b.attempts - a.attempts;
      }),
  )
    .map((row) => row.competency)
    .slice(0, 3);

  return {
    estimatedLevel,
    percentileSegment: stats[0]?.percentile_segment ?? undefined,
    totalAttempts,
    totalCorrect,
    avgReasoningScore,
    strongestCompetencies,
    weakestCompetencies,
    recentTrend: "stable",
    signalLevel,
    signalLabel: signalCopy.signalLabel,
    signalDescription: signalCopy.signalDescription,
    canShowStrongConclusion,
    canShowTrend: false,
    canShowPercentile: false,
    recommendedAction: signalCopy.recommendedAction,
  };
}
