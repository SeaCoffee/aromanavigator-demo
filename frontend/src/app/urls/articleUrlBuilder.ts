import type { Query } from '@/app/types/http';
import type { ArticleListQuery } from '@/app/types/articleTypes';
import type { ID } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { build, seg } from '@/app/utils/urlUtils';

const ARTICLE_DJANGO_BASE = apiRootFor('django', apiAppPaths.articles);
const ARTICLE_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.articles);
const ARTICLE_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.articles);

function api(path: string, query?: ArticleListQuery) {
  return build(path, query as Query | undefined);
}

function createArticleApiBuilder(base: string) {
  return {
    public: {
      list: (query?: ArticleListQuery) => api(`${base}/`, query),
      detail: (articleId: ID) => api(`${base}/${seg(articleId)}`),
    },

    me: {
      list: (query?: ArticleListQuery) => api(`${base}/me`, query),
      create: () => api(`${base}/me`),
      detail: (articleId: ID) => api(`${base}/me/${seg(articleId)}`),
      update: (articleId: ID) => api(`${base}/me/${seg(articleId)}`),
      delete: (articleId: ID) => api(`${base}/me/${seg(articleId)}`),
      submit: (articleId: ID) => api(`${base}/me/${seg(articleId)}/submit`),
    },

    admin: {
      moderation: (query?: ArticleListQuery) =>
        api(`${base}/admin/moderation`, query),
      publish: (articleId: ID) => api(`${base}/admin/${seg(articleId)}/publish`),
      reject: (articleId: ID) => api(`${base}/admin/${seg(articleId)}/reject`),
    },

    tags: {
      list: () => api(`${base}/tags`),
      create: () => api(`${base}/tags`),
    },
  };
}

export const articleApiUrlBuilder = {
  server: createArticleApiBuilder(ARTICLE_DJANGO_BASE),
  anon: createArticleApiBuilder(ARTICLE_ANON_PROXY_BASE),
  user: createArticleApiBuilder(ARTICLE_USER_PROXY_BASE),
} as const;
