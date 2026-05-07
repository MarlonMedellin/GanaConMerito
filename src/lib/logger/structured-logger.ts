export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  requestId?: string;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  [key: string]: unknown;
};

export type StructuredLog = {
  ts: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
};

const shouldLogDebug = process.env.NODE_ENV !== "production" || process.env.LOG_LEVEL === "debug";

function serializeError(error: unknown): StructuredLog["error"] | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function emitLog(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
  if (level === "debug" && !shouldLogDebug) {
    return;
  }

  const payload: StructuredLog = {
    ts: new Date().toISOString(),
    level,
    message,
    context,
    error: serializeError(error),
  };

  const jsonPayload = JSON.stringify(payload);
  if (level === "error") {
    console.error(jsonPayload);
    return;
  }
  if (level === "warn") {
    console.warn(jsonPayload);
    return;
  }
  console.log(jsonPayload);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emitLog("debug", message, context),
  info: (message: string, context?: LogContext) => emitLog("info", message, context),
  warn: (message: string, context?: LogContext, error?: unknown) => emitLog("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) => emitLog("error", message, context, error),
};
