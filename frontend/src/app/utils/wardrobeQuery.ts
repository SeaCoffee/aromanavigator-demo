import type { WardrobeListQuery } from '@/app/types/wardrobeTypes';
import { firstValue } from '@/app/utils/valueUtils';

export type PageSearchParams = Record<string, string | string[] | undefined>;

const WARDROBE_LIST_QUERY_KEYS = [
  'page',
  'page_size',
  'q',
  'search',
  'ordering',
  'status',
  'status_in',
  'fragrance',
  'fragrance_in',
  'brand',
  'brand_in',
  'family',
  'family_in',
  'note',
  'note_in',
  'rating_min',
  'rating_max',
  'created_after',
  'created_before',
  'updated_after',
  'updated_before',
] as const satisfies readonly (keyof WardrobeListQuery)[];

export function toWardrobeListQuery(
  searchParams: PageSearchParams,
): WardrobeListQuery {
  const query: WardrobeListQuery = {};

  WARDROBE_LIST_QUERY_KEYS.forEach((key) => {
    const value = (firstValue(searchParams[key]) ?? '').trim();

    if (value) {
      query[key] = value;
    }
  });

  return query;
}

export function getWardrobePage(query: WardrobeListQuery) {
  const page = Number(query.page || 1);

  return Number.isInteger(page) && page > 0 ? page : 1;
}
