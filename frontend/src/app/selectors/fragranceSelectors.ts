import {
  compactQuery,
  readSearchNumber,
  readSearchNumbers,
  readSearchParam,
  type PageSearchParams,
} from '@/app/utils/searchParamsUtils';

import type {
  DictionaryQuery,
  FragranceListItem,
  FragranceListQuery,
  NoteLevel,
  OfficialNote,
} from '@/app/types/fragranceTypes';
import type { Paginated } from '@/app/types/http';

export const NOTE_LEVELS: NoteLevel[] = ['top', 'heart', 'base'];



export function isNoteLevel(value: string): value is NoteLevel {
  return value === 'top' || value === 'heart' || value === 'base';
}

export function getFragranceTitle(
  fragrance: {
    brand: { name: string };
    name: string;
  },
) {
  return `${fragrance.brand.name} - ${fragrance.name}`;
}

export const NOTE_LEVEL_LABELS: Record<NoteLevel, string> = {
  top: 'Р’РµСЂС…РЅС– РЅРѕС‚Рё',
  heart: 'РќРѕС‚Рё СЃРµСЂС†СЏ',
  base: 'Р‘Р°Р·РѕРІС– РЅРѕС‚Рё',
};

export function getReleaseYearLabel(year: number | null) {
  return year ? String(year) : 'Р С–Рє РЅРµРІС–РґРѕРјРёР№';
}


export function groupOfficialNotes(notes: OfficialNote[]) {
  return {
    top: notes.filter((note) => note.level === 'top'),
    heart: notes.filter((note) => note.level === 'heart'),
    base: notes.filter((note) => note.level === 'base'),
  };
}

export function getCoverImage(
  fragrance: Pick<FragranceListItem, 'cover_image'>,
) {
  return fragrance.cover_image || null;
}

export function sortOfficialNotes(notes: OfficialNote[]) {
  const order: Record<NoteLevel, number> = {
    top: 0,
    heart: 1,
    base: 2,
  };

  return [...notes].sort((left, right) => {
    const byLevel = order[left.level] - order[right.level];
    if (byLevel !== 0) return byLevel;

    const byPosition = left.position - right.position;
    if (byPosition !== 0) return byPosition;

    return String(left.id).localeCompare(String(right.id));
  });
}

export function getPaginationMeta<T>(page: Paginated<T>) {
  return {
    count: page.count,
    hasNext: Boolean(page.next),
    hasPrevious: Boolean(page.previous),
    resultsCount: page.results.length,
  };
}

export function buildDictionaryQuery(
  searchParams?: PageSearchParams,
): DictionaryQuery {
  return compactQuery({
    page: readSearchNumber(searchParams, 'page'),
    page_size: readSearchNumber(searchParams, 'page_size'),
    search: readSearchParam(searchParams, 'search'),
    ordering: readSearchParam(searchParams, 'ordering'),
  });
}

export function buildFragranceListQuery(
  searchParams?: PageSearchParams,
): FragranceListQuery {
  const noteLevel = readSearchParam(searchParams, 'note_level');

  return compactQuery({
    page: readSearchNumber(searchParams, 'page'),
    page_size: readSearchNumber(searchParams, 'page_size'),

    fragrance_id: readSearchNumber(searchParams, 'fragrance_id'),
    name: readSearchParam(searchParams, 'name'),

    brand: readSearchNumber(searchParams, 'brand'),
    note: readSearchNumbers(searchParams, 'note'),
    note_level: isNoteLevel(noteLevel) ? noteLevel : undefined,
    family: readSearchNumbers(searchParams, 'family'),
    perfumer: readSearchNumbers(searchParams, 'perfumer'),
    year_from: readSearchNumber(searchParams, 'year_from'),
    year_to: readSearchNumber(searchParams, 'year_to'),
    q: readSearchParam(searchParams, 'q'),
    ordering: readSearchParam(searchParams, 'ordering') as never,
  });
}
