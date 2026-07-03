import type { ID, Query } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

const preferencePath = {
  families: 'families',
  notes: 'notes',
  perfumers: 'perfumers',
  brands: 'brands',
  seasons: 'seasons',
  concentrations: 'concentrations',
  fragrances: 'fragrances',
} as const;

export type TastePreferenceKind = keyof typeof preferencePath;

export function createTasteProfileApiUrlBuilder(base: string) {
  const preference = (kind: TastePreferenceKind) => {
    const path = preferencePath[kind];

    return {
      list: (query?: Query) => build(`${base}/me/${path}`, query),
      create: () => build(`${base}/me/${path}`),
      detail: (itemId: ID) => build(`${base}/me/${path}/${seg(itemId)}`),
      update: (itemId: ID) => build(`${base}/me/${path}/${seg(itemId)}`),
      delete: (itemId: ID) => build(`${base}/me/${path}/${seg(itemId)}`),
    };
  };

  return {
    me: {
      detail: () => build(`${base}/me`),
      update: () => build(`${base}/me`),
    },

    public: {
      byUserId: (userId: ID) => build(`${base}/users/${seg(userId)}`),
      byDisplayName: (displayName: string) =>
        build(`${base}/u/${seg(displayName)}`),
    },

    preferences: {
      families: preference('families'),
      notes: preference('notes'),
      perfumers: preference('perfumers'),
      brands: preference('brands'),
      seasons: preference('seasons'),
      concentrations: preference('concentrations'),
      fragrances: preference('fragrances'),
    },
  };
}
