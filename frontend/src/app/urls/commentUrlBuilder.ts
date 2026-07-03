import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const COMMENT_DJANGO_BASE = apiRootFor('django', apiAppPaths.comments);
const COMMENT_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.comments);
const COMMENT_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.comments);

function createCommentApiBuilder(base: string) {
  const collection = (query?: Query) => api(`${base}/`, query);

  return {
    list: collection,
    thread: (query?: Query) => api(`${base}/thread`, query),
    modList: (query?: Query) => api(`${base}/mod`, query),
    create: () => collection(),
    detail: (commentId: ID) => `${base}/${seg(commentId)}`,
    update: (commentId: ID) => `${base}/${seg(commentId)}`,
    delete: (commentId: ID) => `${base}/${seg(commentId)}`,
  };
}

export const commentApiUrlBuilder = {
  server: createCommentApiBuilder(COMMENT_DJANGO_BASE),
  anon: createCommentApiBuilder(COMMENT_ANON_PROXY_BASE),
  user: createCommentApiBuilder(COMMENT_USER_PROXY_BASE),
} as const;
