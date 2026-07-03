import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

const FORUM_BASE = '/forum';
const ADMIN_FORUM_BASE = '/admin/forum';

export const forumPageUrlBuilder = {
  home: (query?: Query) => build(FORUM_BASE, query),

  sections: {
    detail: (sectionId: number | string, query?: Query) =>
      build(`${FORUM_BASE}/section/${seg(sectionId)}`, query),

    adminList: (query?: Query) => build(`${ADMIN_FORUM_BASE}/sections`, query),

    adminCreate: () => build(`${ADMIN_FORUM_BASE}/sections/create`),

    adminEdit: (sectionId: number | string) =>
      build(`${ADMIN_FORUM_BASE}/sections/${seg(sectionId)}/edit`),
  },

  topics: {
    create: (query?: Query) => build(`${FORUM_BASE}/create`, query),

    detail: (topicId: number | string, query?: Query) =>
      build(`${FORUM_BASE}/topic/${seg(topicId)}`, query),

    edit: (topicId: number | string) =>
      build(`${FORUM_BASE}/edit/${seg(topicId)}`),

    adminList: (query?: Query) => build(`${ADMIN_FORUM_BASE}/topics`, query),

    adminEdit: (topicId: number | string) =>
      build(`${ADMIN_FORUM_BASE}/topics/${seg(topicId)}/edit`),
  },

  byTag: (tag: string, query?: Query) =>
    build(`${FORUM_BASE}`, {
      ...(query ?? {}),
      tag,
    }),
} as const;
