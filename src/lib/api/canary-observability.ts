import { NextResponse } from "next/server";
import type { ApiErrorCode } from "./error-codes";
import { getRequestIdFromHeaders, getRequestIdHeaderName } from "./request-id";
import { logger } from "@/lib/logger/structured-logger";

export interface RequestObservation {
  requestId: string;
  route: string;
  startedAtMs: number;
}

export function beginRequestObservation(request: Request, route: string): RequestObservation {
  return {
    requestId: getRequestIdFromHeaders(request.headers).requestId,
    route,
    startedAtMs: Date.now(),
  };
}

export function jsonWithRequestId<T>(body: T, status: number, observation: RequestObservation) {
  const response = NextResponse.json(body, { status });
  response.headers.set(getRequestIdHeaderName(), observation.requestId);
  return response;
}

export function maskOperationalId(value: string | null | undefined) {
  if (!value) return undefined;
  return value.length <= 8 ? value : value.slice(0, 8);
}

export function logRequestOutcome(
  observation: RequestObservation,
  params: {
    event: string;
    status: number;
    errorCode?: ApiErrorCode;
    sessionId?: string | null;
    itemId?: string | null;
    opecKey?: string | null;
    extra?: Record<string, unknown>;
    error?: unknown;
  },
) {
  const context = {
    requestId: observation.requestId,
    route: observation.route,
    status: params.status,
    latencyMs: Date.now() - observation.startedAtMs,
    errorCode: params.errorCode,
    sessionId: maskOperationalId(params.sessionId),
    itemId: maskOperationalId(params.itemId),
    opecKey: params.opecKey ?? undefined,
    ...params.extra,
  };

  if (params.status >= 500) {
    logger.error(params.event, context, params.error);
  } else if (params.status >= 400) {
    logger.warn(params.event, context, params.error);
  } else {
    logger.info(params.event, context);
  }
}
