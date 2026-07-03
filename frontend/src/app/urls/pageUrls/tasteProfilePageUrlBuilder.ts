import type { Query } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

export const tasteProfilePageUrlBuilder = {
  me: {
    detail: (query?: Query) => build('/me/perfume-profile', query),
  },

  public: {
    byDisplayName: (displayName: string, query?: Query) =>
      build(`/u/${seg(displayName)}/taste-profile`, query),
  },
} as const;
