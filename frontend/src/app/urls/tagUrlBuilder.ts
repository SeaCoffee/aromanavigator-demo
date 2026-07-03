import type { Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const TAG_DJANGO_BASE = apiRootFor('django', apiAppPaths.tags);
const TAG_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.tags);
const TAG_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.tags);

function createTagApiBuilder(base: string) {
  return {
    list: (query?: Query) => api(base, query),
    popular: (query?: Query) => api(`${base}/popular/`, query),
  };
}

export const tagApiUrlBuilder = {
  server: createTagApiBuilder(TAG_DJANGO_BASE),
  anon: createTagApiBuilder(TAG_ANON_PROXY_BASE),
  user: createTagApiBuilder(TAG_USER_PROXY_BASE),
} as const;
