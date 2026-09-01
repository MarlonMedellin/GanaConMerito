import type { TutorConversationMessage } from "../../types/tutor-turn";

export const TUTOR_CURRENT_MESSAGE_MAX_CHARS = 1_000;
export const TUTOR_HISTORY_MAX_MESSAGES = 6;
export const TUTOR_HISTORY_MAX_EXCHANGES = 3;
export const TUTOR_HISTORY_MAX_CHARS_PER_MESSAGE = 1_000;
export const TUTOR_HISTORY_MAX_TOTAL_CHARS = 4_000;

export interface TutorConversationNormalization {
  currentMessage: string;
  history: TutorConversationMessage[];
  rejected: boolean;
  reasons: string[];
}

export function normalizeTutorConversation(params: {
  message: unknown;
  history?: unknown;
}): TutorConversationNormalization {
  const reasons: string[] = [];
  const currentMessage = typeof params.message === "string" ? params.message.trim().slice(0, TUTOR_CURRENT_MESSAGE_MAX_CHARS) : "";
  if (typeof params.message === "string" && params.message.trim().length > TUTOR_CURRENT_MESSAGE_MAX_CHARS) {
    reasons.push("current_message_truncated");
  }

  if (!Array.isArray(params.history)) {
    return { currentMessage, history: [], rejected: false, reasons };
  }

  const normalized: TutorConversationMessage[] = [];
  let totalChars = 0;
  let previousRole: TutorConversationMessage["role"] | undefined;
  const recent = params.history.slice(-TUTOR_HISTORY_MAX_MESSAGES);

  for (const raw of recent) {
    if (!raw || typeof raw !== "object") {
      reasons.push("invalid_history_entry");
      continue;
    }
    const role = (raw as { role?: unknown }).role;
    const contentValue = (raw as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") {
      reasons.push("invalid_history_role");
      continue;
    }
    if (typeof contentValue !== "string") {
      reasons.push("invalid_history_content");
      continue;
    }
    if (previousRole === role) {
      reasons.push("invalid_history_order");
      continue;
    }
    const content = normalizeHistoryContent(contentValue);
    if (!content) continue;
    if (content.length !== contentValue.trim().length) reasons.push("history_message_truncated");
    if (totalChars + content.length > TUTOR_HISTORY_MAX_TOTAL_CHARS) {
      reasons.push("history_total_limit");
      break;
    }
    normalized.push({ role, content });
    totalChars += content.length;
    previousRole = role;
  }

  const maxMessages = TUTOR_HISTORY_MAX_EXCHANGES * 2;
  return {
    currentMessage,
    history: normalized.slice(-maxMessages),
    rejected: reasons.some((reason) => reason.startsWith("invalid_history")),
    reasons: [...new Set(reasons)],
  };
}

export function buildClientTutorHistory(messages: Array<{ role: "assistant" | "user"; text: string }>): TutorConversationMessage[] {
  return messages
    .filter((message) => !isInitialTutorGreeting(message.text))
    .map((message) => ({ role: message.role, content: message.text.trim().slice(0, TUTOR_HISTORY_MAX_CHARS_PER_MESSAGE) }))
    .filter((message) => message.content.length > 0)
    .slice(-TUTOR_HISTORY_MAX_MESSAGES);
}

function normalizeHistoryContent(content: string) {
  return content.trim().replace(/\s+/g, " ").slice(0, TUTOR_HISTORY_MAX_CHARS_PER_MESSAGE);
}

function isInitialTutorGreeting(text: string) {
  return /Antes de responderte, te ayudar[eé] a pensar/i.test(text);
}
