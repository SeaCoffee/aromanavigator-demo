import 'server-only';

import { revalidatePath } from 'next/cache';

import { getApiErrorMessage } from '@/errors/ApiError';

export type ActionOptions = {
  refreshPaths?: string[];
};

export type ActionResult<T = undefined> =
  | {
      ok: true;
      data: T;
      msg?: string;
    }
  | {
      ok: false;
      msg: string;
    };

const DEFAULT_ERROR_MESSAGE = 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРєРѕРЅР°С‚Рё РґС–СЋ.';

export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  return getApiErrorMessage(error, fallback);
}

export function normalizeRefreshPaths(paths: string[] | undefined): string[] {
  if (!Array.isArray(paths)) {
    return [];
  }

  return Array.from(new Set(paths))
    .filter((path): path is string => typeof path === 'string')
    .map((path) => path.trim())
    .filter((path) => path.startsWith('/'))
    .filter((path) => !path.startsWith('//'))
    .filter((path) => !path.includes('\\'))
    .filter((path) => !path.includes('://'))
    .filter((path) => path.length <= 300)
    .slice(0, 8);
}

export function refreshActionPaths(options?: ActionOptions): void {
  for (const path of normalizeRefreshPaths(options?.refreshPaths)) {
    revalidatePath(path);
  }
}

export function assertPositiveInt(value: unknown, fieldName = 'ID'): number {
  const num = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(num) || Number(num) <= 0) {
    throw new Error(`РќРµРєРѕСЂРµРєС‚РЅРёР№ ${fieldName}.`);
  }

  return Number(num);
}

export function cleanText(
  value: unknown,
  fieldName: string,
  maxLength?: number,
): string {
  const text = String(value ?? '').trim();

  if (!text) {
    throw new Error(`${fieldName}: РїРѕР»Рµ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј.`);
  }

  if (typeof maxLength === 'number' && text.length > maxLength) {
    throw new Error(`${fieldName}: РјР°РєСЃРёРјСѓРј ${maxLength} СЃРёРјРІРѕР»С–РІ.`);
  }

  return text;
}
