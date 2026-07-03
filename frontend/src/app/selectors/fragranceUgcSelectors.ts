import {
  compactQuery,
  readSearchNumber,
  readSearchParam,
  type PageSearchParams,
} from '@/app/utils/searchParamsUtils';

import {
  getFragranceTitle,
  isNoteLevel,
} from '@/app/selectors/fragranceSelectors';

import type {
  AddRequestQuery,
  FragranceAddRequest,
  ModerationStatus,
  NoteSuggestion,
  NoteSuggestionQuery,
  SimilaritySuggestion,
  SimilaritySuggestionQuery,
} from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};
export function isModerationStatus(value: string): value is ModerationStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

export function getScoreLabel(score: number) {
  if (score > 0) return `+${score}`;

  return String(score);
}

export function getSuggestionStatusLabel(status: ModerationStatus) {
  return MODERATION_STATUS_LABELS[status];
}

export function getOtherSimilarityFragrance(
  suggestion: SimilaritySuggestion,
  currentFragranceId: ID,
) {
  return String(suggestion.fragrance_id) === String(currentFragranceId)
    ? suggestion.similar_fragrance
    : suggestion.fragrance;
}

export function getSimilarityTitle(
  suggestion: SimilaritySuggestion,
  currentFragranceId: ID,
) {
  return getFragranceTitle(
    getOtherSimilarityFragrance(suggestion, currentFragranceId),
  );
}

export function groupNoteSuggestionsByLevel(suggestions: NoteSuggestion[]) {
  return {
    top: suggestions.filter((suggestion) => suggestion.level === 'top'),
    heart: suggestions.filter((suggestion) => suggestion.level === 'heart'),
    base: suggestions.filter((suggestion) => suggestion.level === 'base'),
  };
}

export function getAddRequestTitle(request: FragranceAddRequest) {
  return `${request.brand_name} - ${request.fragrance_name}`;
}

export function getAddRequestTexts(request: FragranceAddRequest) {
  return {
    perfumers: request.perfumers_text.trim(),
    notes: request.notes_text.trim(),
    families: request.families_text.trim(),
    links: request.links_text.trim(),
    moderatorComment: request.moderator_comment.trim(),
  };
}

export function buildNoteSuggestionQuery(
  searchParams?: PageSearchParams,
): NoteSuggestionQuery {
  const level = readSearchParam(searchParams, 'level');
  const status = readSearchParam(searchParams, 'status');

  return compactQuery({
    page: readSearchNumber(searchParams, 'page'),
    page_size: readSearchNumber(searchParams, 'page_size'),
    level: isNoteLevel(level) ? level : undefined,
    status: isModerationStatus(status) ? status : undefined,
    ordering: readSearchParam(searchParams, 'ordering') as never,
  });
}

export function buildSimilaritySuggestionQuery(
  searchParams?: PageSearchParams,
): SimilaritySuggestionQuery {
  const status = readSearchParam(searchParams, 'status');

  return compactQuery({
    page: readSearchNumber(searchParams, 'page'),
    page_size: readSearchNumber(searchParams, 'page_size'),
    status: isModerationStatus(status) ? status : undefined,
    ordering: readSearchParam(searchParams, 'ordering') as never,
  });
}

export function buildAddRequestQuery(
  searchParams?: PageSearchParams,
): AddRequestQuery {
  const status = readSearchParam(searchParams, 'status');

  return compactQuery({
    page: readSearchNumber(searchParams, 'page'),
    page_size: readSearchNumber(searchParams, 'page_size'),
    status: isModerationStatus(status) ? status : undefined,
    q: readSearchParam(searchParams, 'q'),
    ordering: readSearchParam(searchParams, 'ordering') as never,
  });
}
