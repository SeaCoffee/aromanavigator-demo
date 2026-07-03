// frontend/src/app/services/notificationServerServices.ts

import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { notificationApiUrlBuilder } from '@/app/urls/notificationApiUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  NotificationAnnouncement,
  NotificationAnnouncementInput,
  NotificationAnnouncementUpdateInput,
  NotificationDeletedResponse,
  NotificationItem,
  NotificationUnreadCountResponse,
  NotificationUpdatedResponse,
  PaginatedResponse,
} from '@/app/types/notificationTypes';

export async function getMyNotificationsServer(query?: Query) {
  return djangoJson<PaginatedResponse<NotificationItem>>(
    notificationApiUrlBuilder.server.list(query),
    { auth: 'required' },
  );
}

export async function getNotificationsUnreadCountServer() {
  return djangoJson<NotificationUnreadCountResponse>(
    notificationApiUrlBuilder.server.unreadCount(),
    { auth: 'required' },
  );
}

export async function getNotificationAnnouncementsServer(query?: Query) {
  return djangoJson<PaginatedResponse<NotificationAnnouncement>>(
    notificationApiUrlBuilder.server.announcements(query),
    { auth: 'required' },
  );
}

export async function markNotificationAnnouncementReadServer(
  announcementId: number | string,
) {
  return djangoJson<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.server.readAnnouncement(announcementId),
    {
      method: 'PATCH',
      auth: 'required',
    },
  );
}

export async function markNotificationReadServer(notificationId: number | string) {
  return djangoJson<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.server.read(notificationId),
    {
      method: 'PATCH',
      auth: 'required',
    },
  );
}

export async function markAllNotificationsReadServer() {
  return djangoJson<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.server.readAll(),
    {
      method: 'PATCH',
      auth: 'required',
    },
  );
}

export async function deleteNotificationServer(notificationId: number | string) {
  return djangoJson<void>(
    notificationApiUrlBuilder.server.delete(notificationId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export async function deleteReadNotificationsServer() {
  return djangoJson<NotificationDeletedResponse>(
    notificationApiUrlBuilder.server.deleteRead(),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export async function recomputeNotificationsUnreadCountServer() {
  return djangoJson<NotificationUnreadCountResponse>(
    notificationApiUrlBuilder.server.recomputeUnreadCount(),
    {
      method: 'POST',
      auth: 'required',
    },
  );
}

export async function getAdminNotificationAnnouncementsServer(query?: Query) {
  return djangoJson<PaginatedResponse<NotificationAnnouncement>>(
    notificationApiUrlBuilder.server.adminAnnouncements(query),
    { auth: 'required' },
  );
}

export async function createNotificationAnnouncementServer(
  payload: NotificationAnnouncementInput,
) {
  return djangoJson<NotificationAnnouncement>(
    notificationApiUrlBuilder.server.createAdminAnnouncement(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export async function updateNotificationAnnouncementServer(
  announcementId: number | string,
  payload: NotificationAnnouncementUpdateInput,
) {
  return djangoJson<NotificationAnnouncement>(
    notificationApiUrlBuilder.server.updateAdminAnnouncement(announcementId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export async function deleteNotificationAnnouncementServer(
  announcementId: number | string,
) {
  return djangoJson<void>(
    notificationApiUrlBuilder.server.deleteAdminAnnouncement(announcementId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}
