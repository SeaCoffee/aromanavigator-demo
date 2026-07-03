import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

const authRoot = apiRootFor('anonProxy', apiAppPaths.auth);
const usersRoot = apiRootFor('anonProxy', apiAppPaths.users);

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export const authAnonApiUrlBuilder = {
  activate: (token: string) => api(`${authRoot}/activate/${seg(token)}`),

  recovery: {
    request: () => api(`${authRoot}/recovery`),
    withToken: (token: string) => api(`${authRoot}/recovery/${seg(token)}`),
  },

  register: () => api(`${usersRoot}/register`),
} as const;
