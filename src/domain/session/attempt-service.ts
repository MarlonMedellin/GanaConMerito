import type { PracticeMode, TutorProfile } from "@/types/session";

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
  getLatestAttemptForSessionItem(sessionId: string, itemId: string): Promise<PracticeAttemptRecord | null>;
  markAssistanceUsed(attemptId: string): Promise<PracticeAttemptRecord | null>;
  submitAttempt(input: SubmitAttemptInput): Promise<{ attempt: PracticeAttemptRecord; isReplay: boolean }>;
}

class InMemoryAttemptStore implements AttemptStore {
  private attempts = new Map<string, PracticeAttemptRecord>();
  private requestDeduplication = new Map<string, string>(); // clientRequestId -> attemptId

  async createAttempt(input: CreateAttemptInput): Promise<PracticeAttemptRecord> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const attemptId = `att-${input.sessionId}-${input.itemId}-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Close any previous active attempt for same session and item
    for (const [id, att] of this.attempts.entries()) {
      if (att.sessionId === input.sessionId && att.itemId === input.itemId && att.phase === "evaluating") {
        this.attempts.set(id, { ...att, phase: "expired" });
      }
    }

    const record: PracticeAttemptRecord = {
      attemptId,
      sessionId: input.sessionId,
      itemId: input.itemId,
      profileId: input.profileId,
      mode: input.mode,
      phase: "evaluating",
      assistanceUsed: false,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.attempts.set(attemptId, record);
    return record;
  }

  async getAttempt(attemptId: string): Promise<PracticeAttemptRecord | null> {
    const att = this.attempts.get(attemptId);
    if (!att) return null;
    if (att.phase === "evaluating" && new Date(att.expiresAt).getTime() < Date.now()) {
      const expiredAtt = { ...att, phase: "expired" as const };
      this.attempts.set(attemptId, expiredAtt);
      return expiredAtt;
    }
    return att;
  }

  async getLatestAttemptForSessionItem(sessionId: string, itemId: string): Promise<PracticeAttemptRecord | null> {
    let latest: PracticeAttemptRecord | null = null;
    for (const att of this.attempts.values()) {
      if (att.sessionId === sessionId && att.itemId === itemId) {
        if (!latest || new Date(att.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
          latest = att;
        }
      }
    }
    if (latest && latest.phase === "evaluating" && new Date(latest.expiresAt).getTime() < Date.now()) {
      latest = { ...latest, phase: "expired" };
      this.attempts.set(latest.attemptId, latest);
    }
    return latest;
  }

  async markAssistanceUsed(attemptId: string): Promise<PracticeAttemptRecord | null> {
    const att = await this.getAttempt(attemptId);
    if (!att) return null;
    const updated = { ...att, assistanceUsed: true };
    this.attempts.set(attemptId, updated);
    return updated;
  }

  async submitAttempt(input: SubmitAttemptInput): Promise<{ attempt: PracticeAttemptRecord; isReplay: boolean }> {
    if (input.clientRequestId && this.requestDeduplication.has(input.clientRequestId)) {
      const existingAttemptId = this.requestDeduplication.get(input.clientRequestId)!;
      const existing = await this.getAttempt(existingAttemptId);
      if (existing) {
        return { attempt: existing, isReplay: true };
      }
    }

    const att = await this.getAttempt(input.attemptId);
    if (!att) {
      throw new Error("ATTEMPT_NOT_FOUND");
    }
    if (att.sessionId !== input.sessionId) {
      throw new Error("ATTEMPT_SESSION_MISMATCH");
    }
    if (att.itemId !== input.itemId) {
      throw new Error("ATTEMPT_ITEM_MISMATCH");
    }
    if (att.profileId !== input.profileId) {
      throw new Error("ATTEMPT_USER_MISMATCH");
    }
    if (att.phase === "expired") {
      throw new Error("ATTEMPT_EXPIRED");
    }
    if (att.phase === "submitted") {
      return { attempt: att, isReplay: true };
    }

    const updated: PracticeAttemptRecord = {
      ...att,
      phase: "submitted",
      selectedOption: input.selectedOption,
      clientRequestId: input.clientRequestId,
      submittedAt: new Date().toISOString(),
    };

    this.attempts.set(input.attemptId, updated);
    if (input.clientRequestId) {
      this.requestDeduplication.set(input.clientRequestId, input.attemptId);
    }

    return { attempt: updated, isReplay: false };
  }
}

export const defaultAttemptStore = new InMemoryAttemptStore();
