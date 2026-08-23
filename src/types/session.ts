export type SessionMode = "practice" | "exam" | "review";

export type SessionState =
  | "onboarding"
  | "diagnostic"
  | "practice"
  | "remediation"
  | "review"
  | "session_close"
  | "expired"
  | "error";

export type SessionProcess =
  | "evaluating_response"
  | "updating_memory"
  | "selecting_next_item"
  | "generating_feedback";

export interface SessionContext {
  sessionId: string;
  profileId: string;
  mode: SessionMode;
  currentState: SessionState;
  currentItemId?: string;
  hintLevel: number;
  activeArea?: string;
  activeCompetency?: string;
  activeProcess?: SessionProcess;
}

export interface StartSessionRequest {
  mode: SessionMode;
  area?: string;
  competency?: string;
}

export interface StartSessionResponse {
  sessionId: string;
  currentState: SessionState;
  mode: SessionMode;
  currentItemId?: string;
  hintLevel: number;
  activeArea?: string;
  activeCompetency?: string;
  inventory?: {
    status: "empty";
    reason: "no_active_v4_items";
    alternatives: string[];
  };
}

export interface AdvanceSessionRequest {
  sessionId: string;
  itemId: string;
  selectedOption: "A" | "B" | "C" | "D";
  userRationale?: string;
  responseTimeMs?: number;
  confidenceSelfReport?: 1 | 2 | 3 | 4 | 5;
}

export interface PracticeQuestionOptionViewModel {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface PracticeQuestionViewModel {
  id: string;
  title: string;
  area: string;
  competency: string;
  stem: string;
  options: PracticeQuestionOptionViewModel[];
  topic?: string;
  context?: string;
  questionType?: string;
  cognitiveLevel?: string;
  topicLabel?: string;
  expectedUserTask?: string;
  cognitiveIntent?: string;
  difficulty?: number;
  tags?: string[];
  misconceptionHints?: string[];
  sourceTruthStatus?: "source_verified" | "synthesized_governed_unverified" | "missing";
}
