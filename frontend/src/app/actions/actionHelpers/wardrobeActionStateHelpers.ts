// frontend/src/app/actions/actionStateHelpers.ts

import type {
  ActionMessage,
  ActionState,
} from '@/app/types/authTypes';
import { isPlainRecord } from '@/app/utils/valueUtils';
import { formatActionMessage } from '@/app/utils/messageUtils';

export function errorMessageFromData(
  data: unknown,
  fallback: string,
): ActionMessage {
  if (!data) return formatActionMessage(fallback);

  if (typeof data === 'string') return formatActionMessage(data, fallback);

  if (Array.isArray(data)) {
    const strings = data.filter((item): item is string => typeof item === 'string');
    return strings.length > 0 ? formatActionMessage(strings, fallback) : formatActionMessage(fallback);
  }

  const record = isPlainRecord(data) ? data : null;

  if (record) {
    if (typeof record.detail === 'string') return formatActionMessage(record.detail, fallback);
    if (typeof record.message === 'string') return formatActionMessage(record.message, fallback);

    return record;
  }

  return formatActionMessage(fallback);
}

export function errorToActionState<TData = unknown>(
  error: unknown,
  fallback: string,
): ActionState<TData> {
  const maybeApiError = error as {
    data?: unknown;
    message?: string;
  };

  return {
    ok: false,
    msg: errorMessageFromData(
      maybeApiError?.data,
      maybeApiError?.message || fallback,
    ),
  };
}
