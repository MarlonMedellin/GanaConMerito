import type { ItemDifficulty, EditorialStatus, TargetPosition, TechnicalRiskMetadata } from "./item-taxonomy";

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

export interface MisconceptionHint {
  pattern: string;
  feedback: string;
}

export interface QuestionTruth {
  itemId: string;
  area: string;
  competency: string;
  topic: string;
  cognitiveIntent: string;
  expectedUserTask: string;
  sourceType: string;
  sourceRefs: string[];
  stem: string;
  options: QuestionTruthOption[];
  correctOption: string;
  correctExplanation: string;
  subarea?: string;
  affirmation?: string;
  evidenceStatement?: string;
  educationalLevel?: string;
  difficulty?: ItemDifficulty | string;
  cognitiveLevel?: string;
  itemType?: string;
  context?: string;
  distractorRationales?: Record<string, string>;
  technicalRisks?: string[] | TechnicalRiskMetadata;
  editorialStatus?: EditorialStatus | string;
  version?: string;
  targetRole?: string;
  targetPosition?: TargetPosition | string;
  applicantProfile?: string;
  tags?: string[];
  canonicalRationale?: string;
  normativeReasoning?: string;
  misconceptionMap?: MisconceptionHint[];
  evaluatesCompetency?: boolean;
  userExpectedAnswer?: string;
  normativeAlignmentSummary?: string;
  sourceTruthStatus?: SourceTruthStatus;
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
  message: string;
  evidence: TutorEvidence;
}

export interface TutorTraceSignals {
  dossierAvailable: boolean;
  responseModeUsed: "pre_answer" | "hint_mode" | "post_answer_feedback" | "review_mode";
  hintLevelUsed?: 1 | 2 | 3;
  misconceptionDetected: boolean;
  guardrailTriggered: boolean;
  fallbackReason?: string;
}

export interface TutorTurnResponse {
  mode: TutorMode;
  intent: TutorIntent;
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
