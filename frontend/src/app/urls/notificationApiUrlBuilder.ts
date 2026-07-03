import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const NOTIFICATION_DJANGO_BASE = apiRootFor(
  'django',
  apiAppPaths.notifications,
);
const NOTIFICATION_USER_PROXY_BASE = apiRootFor(
  'userProxy',
  apiAppPaths.notifications,
);

function createNotificationApiBuilder(base: string) {
  return {
    list: (query?: Query) => api(`${base}/`, query),
    unreadCount: () => `${base}/unread-count`,
    announcements: (query?: Query) => api(`${base}/announcements`, query),
    readAnnouncement: (announcementId: ID) =>
      `${base}/announcements/${seg(announcementId)}/read`,
    read: (notificationId: ID) => `${base}/${seg(notificationId)}/read`,
    readAll: () => `${base}/read-all`,
    delete: (notificationId: ID) => `${base}/${seg(notificationId)}`,
    deleteRead: () => `${base}/read`,
    recomputeUnreadCount: () => `${base}/recompute-unread-count`,
    adminAnnouncements: (query?: Query) =>
      api(`${base}/admin/announcements`, query),
    createAdminAnnouncement: () => `${base}/admin/announcements`,
    updateAdminAnnouncement: (announcementId: ID) =>
      `${base}/admin/announcements/${seg(announcementId)}`,
    deleteAdminAnnouncement: (announcementId: ID) =>
      `${base}/admin/announcements/${seg(announcementId)}/delete`,
  };
}

export const notificationApiUrlBuilder = {
  server: createNotificationApiBuilder(NOTIFICATION_DJANGO_BASE),
  user: createNotificationApiBuilder(NOTIFICATION_USER_PROXY_BASE),
} as const;
