import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { build, seg } from '@/app/utils/urlUtils';

const LIKES_DJANGO_BASE = apiRootFor('django', apiAppPaths.likes);
const LIKES_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.likes);

function createLikeApiBuilder(base: string) {
  return {
    list: (query?: Query) => build(`${base}/`, query),
    create: () => build(`${base}/create`),
    toggle: () => build(`${base}/toggle`),
    deleteByTarget: () => build(`${base}/delete-by-target`),
    delete: (likeId: ID) => build(`${base}/${seg(likeId)}/delete`),
  };
}

export const likeUrlBuilder = {
  server: createLikeApiBuilder(LIKES_DJANGO_BASE),
  user: createLikeApiBuilder(LIKES_USER_PROXY_BASE),
} as const;
