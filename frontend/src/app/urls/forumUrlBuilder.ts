import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const FORUM_DJANGO_BASE = apiRootFor('django', apiAppPaths.forum);
const FORUM_ANON_PROXY_BASE = apiRootFor('anonProxy', apiAppPaths.forum);
const FORUM_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.forum);

function createForumApiBuilder(base: string) {
  return {
    sections: {
      list: (query?: Query) => api(`${base}/sections`, query),
      detail: (sectionId: ID) => `${base}/sections/${seg(sectionId)}`,
      create: () => `${base}/sections`,
      update: (sectionId: ID) => `${base}/sections/${seg(sectionId)}`,
      delete: (sectionId: ID) => `${base}/sections/${seg(sectionId)}`,
    },

    topics: {
      list: (query?: Query) => api(`${base}/topics`, query),
      detail: (topicId: ID) => `${base}/topics/${seg(topicId)}`,
      create: () => `${base}/topics`,
      update: (topicId: ID) => `${base}/topics/${seg(topicId)}`,
      delete: (topicId: ID) => `${base}/topics/${seg(topicId)}`,
    },
  };
}

export const forumApiUrlBuilder = {
  server: createForumApiBuilder(FORUM_DJANGO_BASE),
  anon: createForumApiBuilder(FORUM_ANON_PROXY_BASE),
  user: createForumApiBuilder(FORUM_USER_PROXY_BASE),
} as const;
