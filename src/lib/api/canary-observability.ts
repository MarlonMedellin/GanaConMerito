import { NextResponse } from "next/server";

const REQUEST_ID_HEADER = "x-request-id";

export interface RequestObservation {
  requestId: string;
  route: string;
  startedAtMs: number;
}

interface ObservedResponseParams {
  status: number;
  event: string;
  errorCode?: string;
  sessionId?: string | null;
  itemId?: string | null;
}

function normalizeRequestId(value: string | null) {
  if (!value) return crypto.randomUUID();
  const trimmed = value.trim();
  return /^[A-Za-z0-9._:-]{8,128}$/.test(trimmed) ? trimmed : crypto.randomUUID();
}

function maskOperationalId(value: string | null | undefined) {
  if (!value) return undefined;
  return value.length <= 8 ? value : value.slice(0, 8);
}

export function beginRequestObservation(request: Request, route: string): RequestObservation {
  return {
    requestId: normalizeRequestId(request.headers.get(REQUEST_ID_HEADER)),
    route,
    startedAtMs: Date.now(),
  };
}

export function observedJson<T>(
  observation: RequestObservation,
  body: T,
  params: ObservedResponseParams,
) {
  const record = {
    event: params.event,
    requestId: observation.requestId,
    route: observation.route,
    status: params.status,
    latencyMs: Date.now() - observation.startedAtMs,
    errorCode: params.errorCode,
    sessionId: maskOperationalId(params.sessionId),
    itemId: maskOperationalId(params.itemId),
  };

  const line = JSON.stringify(record);
  if (params.status >= 500) console.error(line);
  else if (params.status >= 400) console.warn(line);
  else console.info(line);

  const response = NextResponse.json(body, { status: params.status });
  response.headers.set(REQUEST_ID_HEADER, observation.requestId);
  return response;
}
