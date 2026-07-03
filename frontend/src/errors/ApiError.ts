// src/errors/ApiError.ts
import type { ApiErrorPayload } from '@/app/types/apiTypes';
import {
  USER_ERROR_MESSAGES,
  isAuthRequiredMessage,
  toUserFacingMessage,
} from '@/errors/userFacingErrors';

export { isAuthRequiredMessage };

export const AUTH_REQUIRED_MESSAGE = USER_ERROR_MESSAGES.authRequired;

export class ApiError<TData extends ApiErrorPayload = ApiErrorPayload> extends Error {
  status: number;
  statusText: string;
  url: string;
  data?: TData;

  constructor(opts: {
    status: number;
    statusText: string;
    url: string;
    data?: TData;
  }) {
    const { status, statusText, data } = opts;
    const message = toUserFacingMessage(
      data,
      `${status} ${statusText}`,
      status,
    );

    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = opts.url;
    this.data = data;
  }
}

export function isApiError<T extends ApiErrorPayload = ApiErrorPayload>(
  error: unknown,
): error is ApiError<T> {
  return error instanceof ApiError;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
): string {
  if (isApiError(error)) {
    return toUserFacingMessage(error.data ?? error.message, fallback, error.status);
  }

  if (error instanceof Error) {
    return toUserFacingMessage(error.message, fallback);
  }

  return toUserFacingMessage(error, fallback);
}

export function getApiStatus(error: unknown): number | undefined {
  return isApiError(error) ? error.status : undefined;
}
