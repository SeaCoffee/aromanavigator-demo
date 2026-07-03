import type { Paginated } from '@/app/types/http';

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function firstValue<T>(value: T | T[] | null | undefined): T | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function paginatedResults<T>(
  data: Paginated<T> | T[] | { results?: T[] } | null | undefined,
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function paginatedTotal<T>(
  data:
    | Paginated<T>
    | T[]
    | { count?: number; total_items?: number; results?: T[] }
    | null
    | undefined,
): number {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  const totalItems = 'total_items' in data ? data.total_items : undefined;
  return data.count ?? totalItems ?? data.results?.length ?? 0;
}

export function stringifyUnknown(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return String(value);
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}
