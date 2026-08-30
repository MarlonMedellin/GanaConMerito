import type { TutorTurnRequest } from "../../../types/tutor-turn";

export interface TutorProvider<TOutput> {
  readonly name: string;
  generate(input: TutorTurnRequest): Promise<TOutput>;
}

export interface TutorShadowOutput {
  schemaVersion: "tutor-shadow-v1";
  visibleMessage: string;
  pedagogicalAction: "explain" | "hint" | "compare" | "feedback" | "recommend" | "degrade";
  evidenceKeys: string[];
  sourceIdsUsed?: string[];
  sourceCitationsUsed?: Array<{ sourceId: string; reference: string }>;
  sourceClaims?: Array<{ sourceId: string; claim: "used_as_evidence" | "presented_as_current" }>;
  uncertainty: "none" | "limited" | "insufficient";
  requiresDeterministicFallback: boolean;
}

export interface TutorShadowExecution {
  status: "accepted" | "rejected" | "failed" | "disabled";
  output?: TutorShadowOutput;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  errorCode?: string;
}
