import type { Query } from '@/app/types/http';
import type { ArticleListQuery } from '@/app/types/articleTypes';
import type { ID } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

const page = (path: string, query?: ArticleListQuery) => {
  return build(path, query as Query | undefined);
};

export const articlesPageUrlBuilder = {
  public: {
    list: (query?: ArticleListQuery) => page('/articles', query),
    detail: (articleId: ID) => page(`/articles/${seg(articleId)}`),
  },

  me: {
    list: (query?: ArticleListQuery) => page('/me/articles', query),
    create: () => page('/me/articles/create'),
    edit: (articleId: ID) => page(`/me/articles/${seg(articleId)}/edit`),
  },

  admin: {
    moderation: (query?: ArticleListQuery) => {
      return page('/admin/articles/moderation', query);
    },
  },
} as const;
