// frontend/src/app/urls/pageUrls/activityPageUrlBuilder.ts

import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

export const activityPageUrlBuilder = {
  me: {
    feed: (query?: Query) => build('/me/activity', query),
  },

  users: {
    byDisplayName: (displayName: string, query?: Query) =>
      build(`/u/${seg(displayName)}/activity`, query),
  },
} as const;
