import type {
  FragranceListQuery,
  FragranceOrdering,
  NoteLevel,
} from '@/app/types/fragranceTypes';
import type { Query } from '@/app/types/http';

export type FragranceSearchFormValues = {
  brand: string;
  fragrance_id: string;
  name: string;
  year_from: string;
  year_to: string;
};

export type BuilderFilterFormValues = {
  family: string[];
  note: string[];
  note_level: '' | NoteLevel;
  perfumer: string[];
};

export const ORDERING_OPTIONS: Array<{
  value: FragranceOrdering;
  label: string;
}> = [
  { value: 'brand', label: 'Р‘СЂРµРЅРґ Рђ-РЇ' },
  { value: '-brand', label: 'Р‘СЂРµРЅРґ РЇ-Рђ' },
  { value: 'name', label: 'РќР°Р·РІР° Рђ-РЇ' },
  { value: '-name', label: 'РќР°Р·РІР° РЇ-Рђ' },
  { value: '-likes', label: 'РќР°Р№Р±С–Р»СЊС€Рµ РІРїРѕРґРѕР±Р°РЅСЊ' },
  { value: '-year', label: 'РќР°Р№РЅРѕРІС–С€С– Р·Р° СЂРѕРєРѕРј' },
  { value: 'year', label: 'РќР°Р№СЃС‚Р°СЂС–С€С– Р·Р° СЂРѕРєРѕРј' },
  { value: '-created_at', label: 'РќРµС‰РѕРґР°РІРЅРѕ РґРѕРґР°РЅС–' },
];

const NOTE_LEVELS: NoteLevel[] = ['top', 'heart', 'base'];

export function fieldValue(value: unknown): string {
  if (value === undefined || value === null || value === false) return '';
  if (Array.isArray(value)) return fieldValue(value[0]);

  return String(value);
}

export function fieldValues(value: unknown): string[] {
  if (value === undefined || value === null || value === false) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return [String(value)];
}

export function fieldOrdering(value: unknown): FragranceOrdering {
  const ordering = fieldValue(value);

  const isKnownOrdering = ORDERING_OPTIONS.some(
    (option) => option.value === ordering,
  );

  return isKnownOrdering ? (ordering as FragranceOrdering) : 'brand';
}

function fieldNoteLevel(value: unknown): '' | NoteLevel {
  const noteLevel = fieldValue(value);

  return NOTE_LEVELS.includes(noteLevel as NoteLevel)
    ? (noteLevel as NoteLevel)
    : '';
}

function appendQueryValue(query: Query, key: string, value: unknown) {
  if (value === undefined || value === null || value === false) return;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      appendQueryValue(query, key, item);
    });

    return;
  }

  const cleanValue = String(value).trim();

  if (!cleanValue) return;

  const currentValue = query[key];

  if (currentValue == null) {
    query[key] = cleanValue;
    return;
  }

  if (Array.isArray(currentValue)) {
    currentValue.push(cleanValue);
    return;
  }

  query[key] = [currentValue, cleanValue];
}

export function buildQuery(values: Record<string, unknown>): Query {
  const query: Query = { page: 1 };

  Object.entries(values).forEach(([key, value]) => {
    appendQueryValue(query, key, value);
  });

  return query;
}

export function getCommonValues(filters: FragranceListQuery) {
  return {
    page_size: fieldValue(filters.page_size),
  };
}

export function getSearchDefaultValues(
  filters: FragranceListQuery,
): FragranceSearchFormValues {
  return {
    brand: fieldValue(filters.brand),
    fragrance_id: fieldValue(filters.fragrance_id),
    name: fieldValue(filters.name),
    year_from: fieldValue(filters.year_from),
    year_to: fieldValue(filters.year_to),
  };
}

export function getBuilderDefaultValues(
  filters: FragranceListQuery,
): BuilderFilterFormValues {
  return {
    family: fieldValues(filters.family),
    note: fieldValues(filters.note),
    note_level: fieldNoteLevel(filters.note_level),
    perfumer: fieldValues(filters.perfumer),
  };
}

export function getAppliedSearchValues(filters: FragranceListQuery) {
  return {
    brand: fieldValue(filters.brand),
    fragrance_id: fieldValue(filters.fragrance_id),
    name: fieldValue(filters.name),
    year_from: fieldValue(filters.year_from),
    year_to: fieldValue(filters.year_to),
  };
}

export function getAppliedBuilderValues(filters: FragranceListQuery) {
  return {
    family: fieldValues(filters.family),
    note: fieldValues(filters.note),
    note_level: fieldNoteLevel(filters.note_level),
    perfumer: fieldValues(filters.perfumer),
  };
}

export function getAppliedOrderingValue(filters: FragranceListQuery) {
  return fieldOrdering(filters.ordering);
}

export function HiddenQueryFields({
  values,
}: {
  values: Record<string, unknown>;
}) {
  return (
    <>
      {Object.entries(values).flatMap(([key, value]) => {
        const valuesArray = Array.isArray(value) ? value : [value];

        return valuesArray
          .map((item) => String(item ?? '').trim())
          .filter(Boolean)
          .map((item, index) => (
            <input
              key={`${key}-${item}-${index}`}
              type="hidden"
              name={key}
              value={item}
            />
          ));
      })}
    </>
  );
}
