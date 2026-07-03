import type { ID, Query } from '@/app/types/http';
import { q, seg } from '@/app/utils/urlUtils';

import type {
  AddRequestQuery,
  AdminSuggestionQuery,
  NoteSuggestionQuery,
  SimilaritySuggestionQuery,
} from '@/app/types/fragranceTypes';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export function createFragranceUgcApiUrlBuilder(base: string) {
  return {
    noteSuggestions: {
      listByFragrance: (fragranceId: ID, query?: NoteSuggestionQuery) =>
        api(`${base}/fragrances/${seg(fragranceId)}/note-suggestions`, query),
      create: (fragranceId: ID) =>
        `${base}/fragrances/${seg(fragranceId)}/note-suggestions/create`,
      vote: (suggestionId: ID) =>
        `${base}/note-suggestions/${seg(suggestionId)}/vote`,
      modList: (query?: AdminSuggestionQuery) =>
        api(`${base}/mod/note-suggestions`, query),
      modStatus: (suggestionId: ID) =>
        `${base}/mod/note-suggestions/${seg(suggestionId)}/status`,
    },

    similaritySuggestions: {
      listByFragrance: (fragranceId: ID, query?: SimilaritySuggestionQuery) =>
        api(
          `${base}/fragrances/${seg(fragranceId)}/similarity-suggestions`,
          query,
        ),
      create: (fragranceId: ID) =>
        `${base}/fragrances/${seg(
          fragranceId,
        )}/similarity-suggestions/create`,
      vote: (suggestionId: ID) =>
        `${base}/similarity-suggestions/${seg(suggestionId)}/vote`,
      modList: (query?: AdminSuggestionQuery) =>
        api(`${base}/mod/similarity-suggestions`, query),
      modStatus: (suggestionId: ID) =>
        `${base}/mod/similarity-suggestions/${seg(suggestionId)}/status`,
    },

    addRequests: {
      create: () => `${base}/add-requests`,
      my: (query?: AddRequestQuery) => api(`${base}/add-requests/my`, query),
      modList: (query?: AddRequestQuery) =>
        api(`${base}/mod/add-requests`, query),
      detail: (id: ID) => `${base}/mod/add-requests/${seg(id)}/detail`,
      modUpdate: (id: ID) => `${base}/mod/add-requests/${seg(id)}`,
      modStatus: (id: ID) => `${base}/mod/add-requests/${seg(id)}/status`,
      attachFragrance: (id: ID) =>
        `${base}/mod/add-requests/${seg(id)}/attach-fragrance`,
      approveWithFragrance: (id: ID) =>
        `${base}/mod/add-requests/${seg(id)}/approve-with-fragrance`,
      createFragranceAndApprove: (id: ID) =>
        `${base}/mod/add-requests/${seg(id)}/create-fragrance-and-approve`,
    },
  };
}
