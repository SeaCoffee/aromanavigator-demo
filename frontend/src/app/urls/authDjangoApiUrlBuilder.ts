import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

const authRoot = apiRootFor('django', apiAppPaths.auth);
const usersRoot = apiRootFor('django', apiAppPaths.users);

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export const authDjangoApiUrlBuilder = {
  login: () => api(`${authRoot}/login`),
  logout: () => api(`${authRoot}/logout`),
  refresh: () => api(`${authRoot}/refresh`),

  activate: (token: string) => api(`${authRoot}/activate/${seg(token)}`),

  recovery: {
    request: () => api(`${authRoot}/recovery`),
    withToken: (token: string) => api(`${authRoot}/recovery/${seg(token)}`),
  },

  social: {
    google: () => api(`${authRoot}/google`),
  },

  register: () => api(`${usersRoot}/register`),
} as const;
