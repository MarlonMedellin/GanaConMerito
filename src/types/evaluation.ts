export type EvaluationSource = "deterministic" | "llm" | "hybrid";

export interface EvaluationResult {
  isCorrect: boolean;
  reasoningScore: number;
  normativeConsistencyScore: number;
  competencyScore: number;
  estimatedThetaDelta: number;
  remediationNeeded: boolean;
  evaluationSource: EvaluationSource;
  evaluationVersion: string;
  qualitativeFeedback?: string;
}

export interface EvaluateRequest {
  itemId: string;
  selectedOption?: "A" | "B" | "C" | "D";
  userRationale?: string;
  responseTimeMs?: number;
  confidenceSelfReport?: 1 | 2 | 3 | 4 | 5;
  priorEstimatedLevel?: number;
}

export interface EvaluateResponse {
  result: EvaluationResult;
}

export interface AdvanceSessionResponse {
  sessionId: string;
  previousState: import("./session").SessionState;
  currentState: import("./session").SessionState;
  evaluation: EvaluationResult;
  answerReview: {
    selectedOption: "A" | "B" | "C" | "D";
    correctOption: "A" | "B" | "C" | "D";
    selectedExplanation?: string;
    correctExplanation?: string;
    learningNote?: string;
    sourceReference?: string;
  };
  feedbackText: string;
  hintLevel: number;
  nextItemId?: string;
  shouldTransition: boolean;
}

export type MetricSignalLevel = "no_signal" | "low_signal" | "emerging_signal" | "usable_signal";

export interface MetricInterpretation {
  signalLevel: MetricSignalLevel;
  signalLabel: string;
  signalDescription: string;
  canShowStrongConclusion: boolean;
  canShowTrend: boolean;
  canShowPercentile: boolean;
  recommendedAction: string;
}

export interface DashboardSummaryMetrics extends MetricInterpretation {
  estimatedLevel: number;
  percentileSegment?: number;
  totalAttempts: number;
  totalCorrect: number;
  avgReasoningScore: number;
  strongestCompetencies: string[];
  weakestCompetencies: string[];
  recentTrend: "up" | "stable" | "down";
}

export interface DashboardSummaryResponse {
  historical: DashboardSummaryMetrics;
  currentSession: DashboardSummaryMetrics | null;
}
