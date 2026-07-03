import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { build, seg } from '@/app/utils/urlUtils';

const FAVORITES_DJANGO_BASE = apiRootFor('django', apiAppPaths.favorites);
const FAVORITES_USER_PROXY_BASE = apiRootFor(
  'userProxy',
  apiAppPaths.favorites,
);

function createFavoriteApiBuilder(base: string) {
  return {
    list: (query?: Query) => build(`${base}/`, query),
    create: () => build(`${base}/create`),
    toggle: () => build(`${base}/toggle`),
    deleteByTarget: () => build(`${base}/by-target`),
    delete: (favoriteId: ID) => build(`${base}/${seg(favoriteId)}`),
  };
}

export const favoriteApiUrlBuilder = {
  server: createFavoriteApiBuilder(FAVORITES_DJANGO_BASE),
  user: createFavoriteApiBuilder(FAVORITES_USER_PROXY_BASE),
} as const;
