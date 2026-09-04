import type { TutorProfile } from "./session";

export type TutorMode =
  | "current_question"
  | "contest_preparation"
  | "performance_analysis"
  | "pre_answer"
  | "hint_mode"
  | "post_answer_feedback"
  | "review_mode";

export type TutorIntent =
  | "explain_question"
  | "give_hint"
  | "compare_options"
  | "clarify_concept"
  | "explain_expected_task"
  | "analyze_user_rationale"
  | "explain_feedback"
  | "recommend_next_practice"
  | "explain_profile_alignment"
  | "explain_contest_rule";

export type RationaleQuality = "weak" | "acceptable" | "strong";

export type SourceTruthStatus = "source_verified" | "synthesized_governed_unverified" | "missing";

export type TutorEvidenceKey =
  | "contest"
  | "aspirational_profile"
  | "question"
  | "user_session"
  | "recent_performance";

export interface ContestTruth {
  contestId: string;
  contestName: string;
  agreementId: string;
  methodologicalGuideId: string;
  testStructureId: string;
  evaluationStructureSummary: string;
  evaluationRulesSummary: string;
  sourceTruthVersion: string;
  sourceTruthStatus?: SourceTruthStatus;
  sourceTruthRefs?: string[];
  insufficientSourceReason?: string;
}

export interface AspirationalProfileTruth {
  profileId: string;
  contestId: string;
  jobName: string;
  hierarchicalLevel: string;
  performanceArea: string;
  purposeSummary: string;
  functionSummary: string;
  functionalCompetencySummary: string;
  behavioralCompetencySummary: string;
  mipgAlignmentSummary: string;
  sourceTruthStatus?: SourceTruthStatus;
  sourceTruthRefs?: string[];
}

export interface QuestionTruthOption {
  key: string;
  text: string;
  rationale?: string;
  isCorrect?: boolean;
}

export interface QuestionSourceEvidence {
  sourceId: string;
  reference: string;
  title?: string;
  sourceType?: string;
  relationType?: "decisive" | "supporting" | string;
  locator?: string;
  sourceTruthStatus?: SourceTruthStatus;
  knowledgeLevel?: "A" | "B" | "C" | "D" | "E" | "F" | string;
}

export interface MisconceptionHint {
  pattern: string;
  feedback: string;
}

export interface QuestionTruth {
  itemId: string;
  area: string;
  competency: string;
  topic: string;
  context?: string;
  questionType?: string;
  cognitiveLevel?: string;
  scope?: string;
  cognitiveIntent: string;
  expectedUserTask: string;
  sourceType: string;
  sourceId?: string;
  sourceRefs: string[];
  resolvedSources?: QuestionSourceEvidence[];
  stem: string;
  options: QuestionTruthOption[];
  correctOption?: string;
  correctExplanation?: string;
  explanations?: Partial<Record<"A" | "B" | "C" | "D", string>>;
  hint?: string;
  learningNote?: string;
  canonicalRationale?: string;
  normativeReasoning?: string;
  misconceptionMap?: MisconceptionHint[];
  evaluatesCompetency?: boolean;
  userExpectedAnswer?: string;
  normativeAlignmentSummary?: string;
  sourceTruthStatus?: SourceTruthStatus;
}

export interface TutorLearningSignal {
  misconceptionDetected: boolean;
  weakSubareaSignal?: string;
  repeatedErrorPattern?: string;
  recommendedNextPractice?: string;
  difficultyMismatch?: string;
  evidenceSummary?: string;
  recommendationEvidenceCount?: number;
  signalStrength?: TutorTraceSignalStrength;
  evidenceVsInference?: {
    evidence: string[];
    inferences: string[];
    recommendations: string[];
  };
  likelyFalsePositive?: boolean;
}

export interface UserSessionTruth {
  sessionId: string;
  userId: string;
  selectedContestId: string;
  selectedProfileId: string;
  currentItemId: string;
  selectedOption?: string;
  userRationale?: string;
  feedback?: string;
  recentPerformanceSummary?: string;
  learningSignals?: TutorLearningSignal;
}

export interface TutorSupportMisconception {
  misconception: string;
  safeRedirect: string;
  pattern?: string;
}

export interface TutorSupportHint {
  level: 1 | 2 | 3;
  hint: string;
}

export interface TutorSupportResponsePolicy {
  noRevealCorrectAnswer: boolean;
  noRevealCorrectLetter: boolean;
  noOptionEliminationByDiscard: boolean;
  noVerbatimCorrectOptionQuote: boolean;
  noScoring: boolean;
  noAttemptStateMutation: boolean;
}

export interface TutorSupportContract {
  instructionalGoal?: string;
  canonicalRationale?: string;
  misconceptionMap?: TutorSupportMisconception[];
  hintLadder?: TutorSupportHint[];
  normativeReasoning?: string;
  responsePolicy?: TutorSupportResponsePolicy;
  qualityFlags?: string[];
  sourceTruthRefs?: string[];
}

export interface TutorEvidence {
  contest?: ContestTruth;
  aspirationalProfile?: AspirationalProfileTruth;
  question?: QuestionTruth;
  userSession: UserSessionTruth;
  tutorSupport?: TutorSupportContract;
}

export interface TutorTurnRequest {
  userId: string;
  sessionId: string;
  itemId: string;
  attemptId?: string;
  clientTurnId?: string;
  profile?: TutorProfile;
  message: string;
  history?: TutorConversationMessage[];
  evidence: TutorEvidence;
}

export interface TutorConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export type TutorTraceSignalStrength = "strong" | "weak" | "insufficient";

export interface TutorTraceSignals {
  dossierAvailable: boolean;
  responseModeUsed: "pre_answer" | "hint_mode" | "post_answer_feedback" | "review_mode";
  hintLevelUsed?: 1 | 2 | 3;
  misconceptionDetected: boolean;
  weakSubareaSignal?: string;
  repeatedErrorPattern?: string;
  recommendedNextPractice?: string;
  difficultyMismatch?: string;
  evidenceSummary?: string;
  recommendationEvidenceCount?: number;
  signalStrength?: TutorTraceSignalStrength;
  evidenceVsInference?: {
    evidence: string[];
    inferences: string[];
    recommendations: string[];
  };
  likelyFalsePositive?: boolean;
  guardrailTriggered: boolean;
  fallbackReason?: string;
  deliveryProvider?: "deterministic" | "openrouter";
  model?: string;
  llmMode?: "off" | "shadow" | "visible";
  llmStatus?: "accepted" | "rejected" | "failed" | "disabled" | "skipped";
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  safetyResult?: "accepted" | "rejected" | "skipped";
  llmEvidenceKeys?: string[];
  sourceSignals?: {
    sourceIdsUsed?: number;
    sourceCitationsUsed?: number;
    historicalCurrentClaims?: number;
  };
  conversationNormalization?: string;
  traceId?: string;
}

export interface TutorTurnResponse {
  mode: TutorMode;
  intent: TutorIntent;
  phase?: "pre_answer" | "post_answer";
  profile?: TutorProfile;
  visibleMessage: string;
  evidenceUsed: TutorEvidenceKey[];
  sourceTruthRefs: string[];
  guardrailsApplied: string[];
  canRevealCorrectAnswer: boolean;
  confidence: number;
  degraded: boolean;
  suggestedAction?: string;
  rationaleQuality?: RationaleQuality;
  traceSignals?: TutorTraceSignals;
  safety?: {
    status: "allowed" | "redirected" | "blocked";
    policyVersion: string;
  };
  delivery?: {
    fallbackUsed: boolean;
  };
}

export interface TutorTurnTrace {
  traceId: string;
  userId: string;
  sessionId?: string;
  itemId?: string;
  contestId?: string;
  profileId?: string;
  mode: TutorMode;
  intent: TutorIntent;
  evidenceUsed: TutorEvidenceKey[];
  sourceTruthRefs: string[];
  guardrailsApplied: string[];
  canRevealCorrectAnswer: boolean;
  degraded: boolean;
  confidence: number;
  rationaleQuality?: RationaleQuality;
  traceSignals?: TutorTraceSignals;
  createdAt: string;
}

export interface TutorTurnResult {
  output: TutorTurnResponse;
  trace: TutorTurnTrace;
}

export type TutorOutput = TutorTurnResponse;
