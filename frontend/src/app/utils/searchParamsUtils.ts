// frontend/src/app/utils/searchParamsUtils.ts

import type { QVal, Query } from '@/app/types/http';
import { asArray, firstValue } from '@/app/utils/valueUtils';

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined) {
  return firstValue(value);
}

export function cleanParam(value: string | string[] | undefined) {
  const first = firstParam(value);
  const clean = first?.trim();

  return clean || undefined;
}

export function booleanStringParam(value: string | string[] | undefined) {
  const clean = cleanParam(value);

  if (clean === 'true' || clean === 'false') {
    return clean;
  }

  return undefined;
}

export function pageParam(value: string | string[] | undefined) {
  const clean = cleanParam(value);

  if (!clean) {
    return undefined;
  }

  const page = Number(clean);

  if (!Number.isInteger(page) || page < 1) {
    return undefined;
  }

  return String(page);
}

export function currentPageFromParams(params: SearchParamsRecord) {
  return Number(pageParam(params.page) ?? '1') || 1;
}

export function buildPageQuery(
  params: SearchParamsRecord,
  page: number,
): Query {
  const query: Query = {};

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'page') return;

    const clean = cleanParam(value);

    if (clean) {
      query[key] = clean;
    }
  });

  query.page = String(page);

  return query;
}




export type RouteSearchParams = Record<
  string,
  string | string[] | null | undefined
>;

export function firstSearchParam(
  value: string | string[] | null | undefined,
): string | undefined {
  return firstValue(value) || undefined;
}

export function toPositiveIntParam(
  value: string | string[] | null | undefined,
): number | undefined {
  const firstValue = firstSearchParam(value);

  if (!firstValue) return undefined;

  const numberValue = Number(firstValue);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return undefined;
  }

  return numberValue;
}

export type PageSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function readSearchParam(
  searchParams: PageSearchParams | undefined,
  key: string,
) {
  return firstValue(searchParams?.[key]) ?? '';
}

export function readSearchNumber(
  searchParams: PageSearchParams | undefined,
  key: string,
) {
  const value = readSearchParam(searchParams, key);

  if (!value) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function readSearchNumbers(
  searchParams: PageSearchParams | undefined,
  key: string,
) {
  const numbers = asArray(searchParams?.[key])
    .flatMap((item) => String(item).split(','))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));

  return numbers.length ? numbers : undefined;
}

export function compactQuery<T extends Query>(query: T): T {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => {
      if (value == null) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;

      return true;
    }),
  ) as T;
}

export function pickQuery<T extends Record<string, QVal | undefined>>(
  query: T,
) {
  return compactQuery(query);
}
