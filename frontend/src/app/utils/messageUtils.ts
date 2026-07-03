import { isPlainRecord, stringifyUnknown } from '@/app/utils/valueUtils';
import {
  USER_ERROR_MESSAGES,
  collectErrorMessages,
  toUserFacingMessage,
} from '@/errors/userFacingErrors';

export function firstStringMessage(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return toUserFacingMessage(value);

  if (Array.isArray(value)) {
    const first = value.find((item): item is string => typeof item === 'string');
    return first ? toUserFacingMessage(first) : '';
  }

  return '';
}

export function formatActionMessage(
  message: unknown,
  fallback: string = USER_ERROR_MESSAGES.generic,
): string {
  const strings = collectErrorMessages(message);

  if (strings.length > 0) {
    return toUserFacingMessage(strings, fallback);
  }

  return toUserFacingMessage(stringifyUnknown(message, fallback), fallback);
}

export function formatKeyedMessage(
  message: unknown,
  fallback: string = USER_ERROR_MESSAGES.generic,
): string {
  return formatActionMessage(message, fallback);
}

export function recordMessage(value: unknown): Record<string, unknown> | null {
  return isPlainRecord(value) ? value : null;
}
