/**
 * Shared API response contracts for the Sprint 33 stabilization path.
 *
 * This file is intentionally additive: it does not migrate existing endpoints
 * yet and should be adopted gradually by route handlers and clients.
 */

export type ApiMeta = {
  requestId?: string;
  timestamp?: string;
  version?: string;
};

export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
  meta?: ApiMeta;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiError = {
  ok: false;
  error: ApiErrorBody;
  meta?: ApiMeta;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiError;

export function apiSuccess<TData>(data: TData, meta?: ApiMeta): ApiSuccess<TData> {
  return meta ? { ok: true, data, meta } : { ok: true, data };
}

export function apiError(error: ApiErrorBody, meta?: ApiMeta): ApiError {
  return meta ? { ok: false, error, meta } : { ok: false, error };
}

export function isApiSuccess<TData>(response: ApiResponse<TData>): response is ApiSuccess<TData> {
  return response.ok === true;
}

export function isApiError<TData>(response: ApiResponse<TData>): response is ApiError {
  return response.ok === false;
}
