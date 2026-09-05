import { getSupabaseAdminClient } from "../../lib/supabase/admin";

import type { PracticeMode } from "@/types/session";

export type AttemptPhase = "loading" | "evaluating" | "submitting" | "submitted" | "transitioning" | "expired" | "error";

export interface PracticeAttemptRecord {
  attemptId: string;
  sessionId: string;
  itemId: string;
  profileId: string;
  mode: PracticeMode;
  phase: AttemptPhase;
  assistanceUsed: boolean;
  selectedOption?: "A" | "B" | "C" | "D";
  clientRequestId?: string;
  createdAt: string;
  submittedAt?: string;
  expiresAt: string;
}

export interface CreateAttemptInput {
  sessionId: string;
  itemId: string;
  profileId: string;
  mode: PracticeMode;
}

export interface SubmitAttemptInput {
  attemptId: string;
  sessionId: string;
  itemId: string;
  profileId: string;
  selectedOption: "A" | "B" | "C" | "D";
  clientRequestId: string;
}

export interface AttemptStore {
  createAttempt(input: CreateAttemptInput): Promise<PracticeAttemptRecord>;
  getAttempt(attemptId: string): Promise<PracticeAttemptRecord | null>;
  getActiveAttempt(sessionId: string): Promise<PracticeAttemptRecord | null>;
}

function record(row: any): PracticeAttemptRecord {
  return { attemptId: row.id, sessionId: row.session_id, itemId: row.question_id,
    profileId: row.profile_id, mode: row.practice_mode, phase: row.phase,
    assistanceUsed: row.assistance_used, selectedOption: row.selected_option,
    clientRequestId: row.client_request_id, createdAt: row.created_at,
    submittedAt: row.submitted_at, expiresAt: row.expires_at };
}

export class SupabaseAttemptStore implements AttemptStore {
  constructor(private readonly client = getSupabaseAdminClient) {}
  async createAttempt(input: CreateAttemptInput) {
    const {data, error} = await this.client().rpc("open_practice_attempt", {
      p_profile_id: input.profileId, p_session_id: input.sessionId, p_question_id: input.itemId,
    });
    if (error) throw new Error(error.message);
    return record(data);
  }
  async getAttempt(attemptId: string) {
    const {data, error} = await this.client().from("practice_attempts").select("*").eq("id", attemptId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? record(data) : null;
  }
  async getActiveAttempt(sessionId: string) {
    const {data, error} = await this.client().from("practice_attempts").select("*").eq("session_id", sessionId).eq("phase", "evaluating").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? record(data) : null;
  }
}

export const defaultAttemptStore = new SupabaseAttemptStore();
