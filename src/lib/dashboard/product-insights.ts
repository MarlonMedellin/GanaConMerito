import {
  getDashboardAccuracy,
  type DashboardTopicBreakdownRow,
} from "@/lib/dashboard/summary-metrics";

export const MIN_ATTEMPTS_FOR_OBSERVED_INSIGHT = 3;

export type ReadinessLabel = "consolidar" | "mantener" | "reforzar";

export interface CompetencyInsight {
  row: DashboardTopicBreakdownRow;
  accuracy: number;
  percent: number;
}

function toInsight(row: DashboardTopicBreakdownRow): CompetencyInsight {
  const accuracy = getDashboardAccuracy(row);
  return {
    row,
    accuracy,
    percent: Math.round(accuracy * 100),
  };
}

export function getEligibleInsights(rows: DashboardTopicBreakdownRow[]) {
  return rows
    .filter((row) => row.attempts >= MIN_ATTEMPTS_FOR_OBSERVED_INSIGHT)
    .map(toInsight);
}

export function getPriorityFocus(rows: DashboardTopicBreakdownRow[]) {
  return [...getEligibleInsights(rows)].sort((a, b) => {
    const accuracyDiff = a.accuracy - b.accuracy;
    if (accuracyDiff !== 0) return accuracyDiff;
    return b.row.attempts - a.row.attempts;
  })[0];
}

export function getStrongestSignal(rows: DashboardTopicBreakdownRow[]) {
  return [...getEligibleInsights(rows)].sort((a, b) => {
    const accuracyDiff = b.accuracy - a.accuracy;
    if (accuracyDiff !== 0) return accuracyDiff;
    return b.row.attempts - a.row.attempts;
  })[0];
}

export function getReadinessLabel(accuracy: number): ReadinessLabel {
  if (accuracy >= 0.8) return "consolidar";
  if (accuracy >= 0.65) return "mantener";
  return "reforzar";
}

