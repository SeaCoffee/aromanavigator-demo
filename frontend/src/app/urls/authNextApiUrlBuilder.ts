import type { Query } from '@/app/types/http';
import { build } from '@/app/utils/urlUtils';

export const authNextApiUrlBuilder = {
  refresh: (query?: Query) => build('/api/auth/refresh', query),
} as const;
