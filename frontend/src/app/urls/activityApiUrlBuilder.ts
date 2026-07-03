import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const ACTIVITY_DJANGO_BASE = apiRootFor('django', apiAppPaths.activity);
const ACTIVITY_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.activity);
const ACTIVITY_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.activity);

function createActivityApiBuilder(base: string) {
  return {
    feed: (query?: Query) => api(`${base}/feed`, query),
    publicFeed: (query?: Query) => api(`${base}/public`, query),
    userFeed: (userId: ID, query?: Query) =>
      api(`${base}/user/${seg(userId)}`, query),
    userFeedByDisplayName: (displayName: string, query?: Query) =>
      api(`${base}/user/by-display-name/${seg(displayName)}`, query),
    targetFeed: (
      app: string,
      model: string,
      objectId: ID,
      query?: Query,
    ) => api(`${base}/target/${seg(app)}/${seg(model)}/${seg(objectId)}`, query),
  };
}

export const activityApiUrlBuilder = {
  server: createActivityApiBuilder(ACTIVITY_DJANGO_BASE),
  anon: createActivityApiBuilder(ACTIVITY_ANON_PROXY_BASE),
  user: createActivityApiBuilder(ACTIVITY_USER_PROXY_BASE),
} as const;
