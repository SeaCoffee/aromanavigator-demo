import type { ID, Query } from '@/app/types/http';
import type { WardrobeListQuery } from '@/app/types/wardrobeTypes';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { build, seg } from '@/app/utils/urlUtils';

const WARDROBE_DJANGO_BASE = apiRootFor('django', apiAppPaths.wardrobe);
const WARDROBE_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.wardrobe);
const WARDROBE_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.wardrobe);

function api(path: string, query?: WardrobeListQuery) {
  return build(path, query as Query | undefined);
}

function createWardrobeApiBuilder(base: string) {
  return {
    me: {
      list: (query?: WardrobeListQuery) => api(`${base}/me`, query),
      create: () => api(`${base}/me`),
      detail: (itemId: ID) => api(`${base}/me/${seg(itemId)}`),
      update: (itemId: ID) => api(`${base}/me/${seg(itemId)}`),
      delete: (itemId: ID) => api(`${base}/me/${seg(itemId)}`),
    },

    public: {
      byUserId: (userId: ID, query?: WardrobeListQuery) =>
        api(`${base}/users/${seg(userId)}`, query),
      byDisplayName: (displayName: string, query?: WardrobeListQuery) =>
        api(`${base}/u/${seg(displayName)}`, query),
    },
  };
}

export const wardrobeApiUrlBuilder = {
  server: createWardrobeApiBuilder(WARDROBE_DJANGO_BASE),
  anon: createWardrobeApiBuilder(WARDROBE_ANON_PROXY_BASE),
  user: createWardrobeApiBuilder(WARDROBE_USER_PROXY_BASE),
} as const;
