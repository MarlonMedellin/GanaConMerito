/**
 * Request ID helpers for API observability.
 *
 * This module is additive and intentionally framework-light so it can be
 * adopted gradually by Next.js route handlers, logging utilities, and tests.
 */

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_PREFIX = "req";
const REQUEST_ID_RANDOM_BYTES = 16;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{8,128}$/;

export type RequestIdMeta = {
  requestId: string;
  source: "incoming-header" | "generated";
};

export function getRequestIdHeaderName(): string {
  return REQUEST_ID_HEADER;
}

export function isValidRequestId(value: string | null | undefined): value is string {
  if (!value) return false;
  return REQUEST_ID_PATTERN.test(value);
}

export function createRequestId(): string {
  const globalCrypto = globalThis.crypto;

  if (globalCrypto?.randomUUID) {
    return `${REQUEST_ID_PREFIX}_${globalCrypto.randomUUID()}`;
  }

  if (globalCrypto?.getRandomValues) {
    const bytes = new Uint8Array(REQUEST_ID_RANDOM_BYTES);
    globalCrypto.getRandomValues(bytes);
    const encoded = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${REQUEST_ID_PREFIX}_${encoded}`;
  }

  return `${REQUEST_ID_PREFIX}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export function resolveRequestId(incomingRequestId?: string | null): RequestIdMeta {
  if (isValidRequestId(incomingRequestId)) {
    return {
      requestId: incomingRequestId,
      source: "incoming-header",
    };
  }

  return {
    requestId: createRequestId(),
    source: "generated",
  };
}

export function getRequestIdFromHeaders(headers: Headers): RequestIdMeta {
  return resolveRequestId(headers.get(REQUEST_ID_HEADER));
}

export function withRequestIdHeader(headers: Headers, requestId: string): Headers {
  const nextHeaders = new Headers(headers);

  if (isValidRequestId(requestId)) {
    nextHeaders.set(REQUEST_ID_HEADER, requestId);
  }

  return nextHeaders;
}
