import { userApi } from '@/app/services/userApi';
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
import { notificationApiUrlBuilder } from '@/app/urls/notificationApiUrlBuilder';

export function getMyNotifications(query?: Query) {
  return userApi.get<PaginatedResponse<NotificationItem>>(
    notificationApiUrlBuilder.user.list(query),
    { cache: 'no-store' },
  );
}

export function getNotificationsUnreadCount() {
  return userApi.get<NotificationUnreadCountResponse>(
    notificationApiUrlBuilder.user.unreadCount(),
    { cache: 'no-store' },
  );
}

export function getNotificationAnnouncements(query?: Query) {
  return userApi.get<PaginatedResponse<NotificationAnnouncement>>(
    notificationApiUrlBuilder.user.announcements(query),
    { cache: 'no-store' },
  );
}

export function markNotificationAnnouncementRead(
  announcementId: number | string,
) {
  return userApi.patch<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.user.readAnnouncement(announcementId),
    { cache: 'no-store' },
  );
}

export function markNotificationRead(notificationId: number | string) {
  return userApi.patch<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.user.read(notificationId),
    { cache: 'no-store' },
  );
}

export function markAllNotificationsRead() {
  return userApi.patch<NotificationUpdatedResponse>(
    notificationApiUrlBuilder.user.readAll(),
    { cache: 'no-store' },
  );
}

export function deleteNotification(notificationId: number | string) {
  return userApi.delete<void>(
    notificationApiUrlBuilder.user.delete(notificationId),
    { cache: 'no-store' },
  );
}

export function deleteReadNotifications() {
  return userApi.delete<NotificationDeletedResponse>(
    notificationApiUrlBuilder.user.deleteRead(),
    { cache: 'no-store' },
  );
}

export function recomputeNotificationsUnreadCount() {
  return userApi.post<NotificationUnreadCountResponse>(
    notificationApiUrlBuilder.user.recomputeUnreadCount(),
    { cache: 'no-store' },
  );
}

export function getAdminNotificationAnnouncements(query?: Query) {
  return userApi.get<PaginatedResponse<NotificationAnnouncement>>(
    notificationApiUrlBuilder.user.adminAnnouncements(query),
    { cache: 'no-store' },
  );
}

export function createNotificationAnnouncement(
  payload: NotificationAnnouncementInput,
) {
  return userApi.post<NotificationAnnouncement, NotificationAnnouncementInput>(
    notificationApiUrlBuilder.user.createAdminAnnouncement(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function updateNotificationAnnouncement(
  announcementId: number | string,
  payload: NotificationAnnouncementUpdateInput,
) {
  return userApi.patch<
    NotificationAnnouncement,
    NotificationAnnouncementUpdateInput
  >(notificationApiUrlBuilder.user.updateAdminAnnouncement(announcementId), {
    json: payload,
    cache: 'no-store',
  });
}

export function deleteNotificationAnnouncement(announcementId: number | string) {
  return userApi.delete<void>(
    notificationApiUrlBuilder.user.deleteAdminAnnouncement(announcementId),
    { cache: 'no-store' },
  );
}
