import { build } from '@/app/utils/urlUtils';

import type { Query } from '@/app/types/http';

export const socialPageUrlBuilder = {
  subscriptions: (query?: Query) => build('/me/subscriptions', query),
  followers: (query?: Query) => build('/me/followers', query),
  following: (query?: Query) => build('/me/following', query),
} as const;
