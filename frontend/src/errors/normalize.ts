import { ApiError, getApiErrorMessage } from '@/errors/ApiError';
import {
  USER_ERROR_MESSAGES,
  collectErrorMessages,
  toUserFacingMessage,
} from '@/errors/userFacingErrors';

type Search = Record<string, string | string[] | undefined>;

type ServerError =
  | { detail?: string; message?: string; code?: string; messages?: unknown }
  | Record<string, unknown>
  | null
  | undefined;

export async function normalizeErrorsFromResponse(
  res: Response,
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
): Promise<string[]> {
  let payload: unknown = null;

  try {
    payload = await res.clone().json();
  } catch {
    payload = await res.clone().text().catch(() => null);
  }

  return normalizeErrors(payload as ServerError, fallback);
}

export function normalizeErrors(
  data: ServerError,
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
): string[] {
  if (data instanceof ApiError) return [getApiErrorMessage(data, fallback)];

  const messages = collectErrorMessages(data).map((message) => {
    return toUserFacingMessage(message, fallback);
  });

  const cleanMessages = Array.from(
    new Set(messages.filter((message) => message && message !== fallback)),
  );

  return cleanMessages.length ? cleanMessages : [toUserFacingMessage(data, fallback)];
}

export function firstError(
  data: ServerError,
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
): string {
  return normalizeErrors(data, fallback)[0] ?? fallback;
}

export function normalizeQueryError(sp: Search): string | undefined {
  const raw = typeof sp?.error === 'string' ? sp.error : undefined;
  if (!raw) return undefined;

  if (
    raw === 'NEXT_REDIRECT' ||
    raw === 'NEXT_NOT_FOUND' ||
    raw === 'NEXT_ROUTER_STATE_TREE'
  ) {
    return undefined;
  }

  try {
    return firstError(JSON.parse(raw), USER_ERROR_MESSAGES.requestFailed);
  } catch {
    return toUserFacingMessage(raw, USER_ERROR_MESSAGES.requestFailed);
  }
}
