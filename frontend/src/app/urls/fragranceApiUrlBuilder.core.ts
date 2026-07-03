import type { ID, Query } from '@/app/types/http';
import { q, seg } from '@/app/utils/urlUtils';

import type {
  DictionaryQuery,
  FragranceListQuery,
} from '@/app/types/fragranceTypes';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export function createFragranceApiUrlBuilder(base: string) {
  return {
    options: {
      brands: (query?: Query) => api(`${base}/options/brands`, query),
      notes: (query?: Query) => api(`${base}/options/notes`, query),
      families: (query?: Query) => api(`${base}/options/families`, query),
      perfumers: (query?: Query) => api(`${base}/options/perfumers`, query),
      fragrances: (query?: Query) => api(`${base}/options/fragrances`, query),
    },

    brands: {
      list: (query?: DictionaryQuery) => api(`${base}/brands`, query),
      detail: (slug: string) => `${base}/brands/${seg(slug)}`,
      create: () => `${base}/brands/create`,
    },

    perfumers: {
      list: (query?: DictionaryQuery) => api(`${base}/perfumers`, query),
      detail: (id: ID) => `${base}/perfumers/${seg(id)}`,
      create: () => `${base}/perfumers/create`,
    },

    notes: {
      list: (query?: DictionaryQuery) => api(`${base}/notes`, query),
      detail: (slug: string) => `${base}/notes/${seg(slug)}`,
      create: () => `${base}/notes/create`,
    },

    families: {
      list: (query?: DictionaryQuery) => api(`${base}/families`, query),
      detail: (slug: string) => `${base}/families/${seg(slug)}`,
      create: () => `${base}/families/create`,
    },

    fragrances: {
      list: (query?: FragranceListQuery) => api(`${base}/fragrances`, query),
      detail: (id: ID) => `${base}/fragrances/${seg(id)}`,
      detailBySlug: (slug: string) => `${base}/fragrances/slug/${seg(slug)}`,
      create: () => `${base}/fragrances/create`,
      update: (id: ID) => `${base}/fragrances/${seg(id)}/update`,
      delete: (id: ID) => `${base}/fragrances/${seg(id)}/delete`,
    },

    official: {
      perfumers: {
        add: (fragranceId: ID) =>
          `${base}/fragrances/${seg(fragranceId)}/official/perfumers`,
        delete: (fragranceId: ID, perfumerId: ID) =>
          `${base}/fragrances/${seg(fragranceId)}/official/perfumers/${seg(
            perfumerId,
          )}/delete`,
      },

      families: {
        add: (fragranceId: ID) =>
          `${base}/fragrances/${seg(fragranceId)}/official/families`,
        delete: (fragranceId: ID, familyId: ID) =>
          `${base}/fragrances/${seg(fragranceId)}/official/families/${seg(
            familyId,
          )}/delete`,
      },

      notes: {
        add: (fragranceId: ID) =>
          `${base}/fragrances/${seg(fragranceId)}/official/notes`,
        update: (fragranceId: ID, noteId: ID, level: string) =>
          `${base}/fragrances/${seg(fragranceId)}/official/notes/${seg(
            noteId,
          )}/${seg(level)}`,
        delete: (fragranceId: ID, noteId: ID, level: string) =>
          `${base}/fragrances/${seg(fragranceId)}/official/notes/${seg(
            noteId,
          )}/${seg(level)}/delete`,
      },
    },
  };
}
