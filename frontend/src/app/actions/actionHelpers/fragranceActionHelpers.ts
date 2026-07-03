import type {
  ActionErrorMessage,
  ActionResult,
  ModerationStatus,
  NoteLevel,
} from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';
import {
  AUTH_REQUIRED_MESSAGE,
  getApiErrorMessage,
  isApiError,
  isAuthRequiredMessage,
} from '@/errors/ApiError';
import { isPlainRecord } from '@/app/utils/valueUtils';
import { USER_ERROR_MESSAGES, toUserFacingMessage } from '@/errors/userFacingErrors';

const MIN_RELEASE_YEAR = 1500;
const MAX_RELEASE_YEAR = new Date().getFullYear() + 1;

export function ok(msg?: string): ActionResult<void>;
export function ok<T>(data: T, msg?: string): ActionResult<T>;
export function ok<T>(
  dataOrMsg?: T | string,
  msg?: string,
): ActionResult<T | void> {
  if (typeof dataOrMsg === 'string' && msg === undefined) {
    return { ok: true, msg: dataOrMsg };
  }

  if (dataOrMsg === undefined) {
    return msg ? { ok: true, msg } : { ok: true };
  }

  return msg
    ? { ok: true, data: dataOrMsg as T, msg }
    : { ok: true, data: dataOrMsg as T };
}

export function fail<T = void>(msg: ActionErrorMessage): ActionResult<T> {
  return { ok: false, msg };
}

export function actionResultMessage(result: ActionResult<unknown>): string {
  if (result.ok) {
    return result.msg ? `Р“РѕС‚РѕРІРѕ: ${result.msg}` : 'Р“РѕС‚РѕРІРѕ';
  }

  const message =
    stringifyActionMessage(result.msg) ?? 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.';

  return toFriendlyActionMessage(message);
}

export function isSuccessMessage(message: string) {
  return message.startsWith('Р“РѕС‚РѕРІРѕ');
}

export function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export function readOptionalString(
  formData: FormData,
  key: string,
): string | undefined {
  const value = readString(formData, key);
  return value || undefined;
}

export function readPresentString(
  formData: FormData,
  key: string,
): string | undefined {
  if (!formData.has(key)) return undefined;
  return readString(formData, key);
}

export function readNumber(formData: FormData, key: string): number | undefined {
  const value = readString(formData, key);

  if (!value) return undefined;

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function readRequiredNumber(formData: FormData, key: string): number {
  const value = readNumber(formData, key);

  if (value === undefined) {
    throw new Error(`РџРѕР»Рµ ${key} РѕР±РѕРІ'СЏР·РєРѕРІРµ.`);
  }

  return value;
}

export function readNullableNumber(
  formData: FormData,
  key: string,
): number | null | undefined {
  if (!formData.has(key)) return undefined;

  const value = readString(formData, key);
  if (!value) return null;

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function readNullableReleaseYear(
  formData: FormData,
  key = 'release_year',
): number | null | undefined {
  if (!formData.has(key)) return undefined;

  const value = readString(formData, key);
  if (!value) return null;

  if (!/^\d{4}$/.test(value)) {
    throw new Error('Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё.');
  }

  const year = Number(value);

  if (year < MIN_RELEASE_YEAR || year > MAX_RELEASE_YEAR) {
    throw new Error(
      `Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” Р±СѓС‚Рё РІ РјРµР¶Р°С… ${MIN_RELEASE_YEAR}-${MAX_RELEASE_YEAR}.`,
    );
  }

  return year;
}

export function readNoteLevel(formData: FormData, key = 'level'): NoteLevel {
  return readOptionalNoteLevel(formData, key) ?? 'top';
}

export function readOptionalNoteLevel(
  formData: FormData,
  key = 'level',
): NoteLevel | undefined {
  const value = readString(formData, key);

  if (value === 'top' || value === 'heart' || value === 'base') {
    return value;
  }

  return undefined;
}

export function readModerationStatus(
  formData: FormData,
  key = 'status',
): ModerationStatus {
  const value = readString(formData, key);

  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value;
  }

  throw new Error('РќРµРєРѕСЂРµРєС‚РЅРёР№ СЃС‚Р°С‚СѓСЃ.');
}

export function readVoteValue(formData: FormData): 1 | -1 {
  const value = Number(formData.get('value'));
  return value === -1 ? -1 : 1;
}

export function readId(formData: FormData, key = 'id'): ID {
  const value = readString(formData, key);

  if (!value) {
    throw new Error(`РџРѕР»Рµ ${key} РѕР±РѕРІ'СЏР·РєРѕРІРµ.`);
  }

  return value;
}

export function readIds(formData: FormData, key: string): ID[] {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function stringifyActionMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => stringifyActionMessage(item))
      .filter((item): item is string => Boolean(item));

    return parts.length ? parts.join(', ') : null;
  }

  if (!isPlainRecord(value)) {
    return null;
  }

  const detail = stringifyActionMessage(value.detail);
  if (detail) return detail;

  const message = stringifyActionMessage(value.message);
  if (message) return message;

  const parts = Object.entries(value)
    .map(([key, item]) => {
      const text = stringifyActionMessage(item);
      return text ? `${key}: ${text}` : '';
    })
    .filter(Boolean);

  return parts.length ? parts.join('; ') : null;
}

export function normalizeActionError(error: unknown): ActionErrorMessage {
  if (isApiError(error)) {
    const message = getApiErrorMessage(error, 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.');

    if (message === AUTH_REQUIRED_MESSAGE || isAuthRequiredMessage(message)) {
      return AUTH_REQUIRED_MESSAGE;
    }

    if (isPlainRecord(error.data)) {
      const rootMessage =
        stringifyActionMessage(error.data.detail) ??
        stringifyActionMessage(error.data.message);

      if (rootMessage) {
        return toFriendlyActionMessage(rootMessage);
      }

      return toUserFacingMessage(error.data, USER_ERROR_MESSAGES.generic);
    }

    return toFriendlyActionMessage(message);
  }

  if (isPlainRecord(error) && 'data' in error && isPlainRecord(error.data)) {
    const detail = stringifyActionMessage(error.data.detail);

    if (detail) {
      return toFriendlyActionMessage(detail);
    }

    return toUserFacingMessage(error.data, USER_ERROR_MESSAGES.generic);
  }

  if (error instanceof Error) {
    return toFriendlyActionMessage(error.message);
  }

  if (typeof error === 'string') {
    return toFriendlyActionMessage(error);
  }

  if (isPlainRecord(error)) {
    return error;
  }

  return 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.';
}

export function toFriendlyActionMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    message === AUTH_REQUIRED_MESSAGE ||
    isAuthRequiredMessage(message) ||
    normalized.includes('401') ||
    normalized.includes('authentication')
  ) {
    return AUTH_REQUIRED_MESSAGE;
  }

  return toUserFacingMessage(message, USER_ERROR_MESSAGES.generic);
}
