import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

export const authPageUrlBuilder = {
  login: (query?: Query) => build('/login', query),
  register: (query?: Query) => build('/register', query),

  activate: (token: string) => build(`/activate/${seg(token)}`),

  recovery: {
    request: (query?: Query) => build('/recovery', query),
    reset: (token: string) => build(`/recovery/${seg(token)}`),
  },
} as const;
