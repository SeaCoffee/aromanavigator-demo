import type { Query } from '@/app/types/http';
import { build } from '@/app/utils/urlUtils';

export const sitePageUrlBuilder = {
  public: {
    home: () => build('/'),
    articles: (query?: Query) => build('/articles', query),
    forum: (query?: Query) => build('/forum', query),
  },

  private: {
    profile: () => build('/me'),
  },
} as const;
