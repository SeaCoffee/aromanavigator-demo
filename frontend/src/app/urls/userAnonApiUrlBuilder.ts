import { q, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';

const root = apiRootFor('anonProxy', apiAppPaths.users);

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export const userAnonApiUrlBuilder = {
  create: () => api(`${root}/register`),

  publicList: (query?: Query) => api(`${root}/list`, query),
  search: (query?: Query) => api(`${root}/search`, query),
  byUsername: (username: string) => api(`${root}/u/${seg(username)}`),
} as const;
