import { describe, expect, it } from 'vitest';

import { notificationApiUrlBuilder } from '@/app/urls/notificationApiUrlBuilder';

describe('notificationApiUrlBuilder.server', () => {
  it('builds notifications list url', () => {
    expect(notificationApiUrlBuilder.server.list()).toBe('/userApi/notifications/');
  });

  it('builds notifications list url with query', () => {
    expect(
      notificationApiUrlBuilder.server.list({
        page: 2,
        is_read: false,
      }),
    ).toBe('/userApi/notifications/?page=2&is_read=false');
  });

  it('builds unread count url', () => {
    expect(notificationApiUrlBuilder.server.unreadCount()).toBe(
      '/userApi/notifications/unread-count',
    );
  });

  it('builds announcement urls', () => {
    expect(notificationApiUrlBuilder.server.announcements({ page_size: 20 })).toBe(
      '/userApi/notifications/announcements?page_size=20',
    );
    expect(notificationApiUrlBuilder.server.readAnnouncement(7)).toBe(
      '/userApi/notifications/announcements/7/read',
    );
  });

  it('builds admin announcement urls', () => {
    expect(notificationApiUrlBuilder.server.adminAnnouncements()).toBe(
      '/userApi/notifications/admin/announcements',
    );
    expect(notificationApiUrlBuilder.server.updateAdminAnnouncement(7)).toBe(
      '/userApi/notifications/admin/announcements/7',
    );
    expect(notificationApiUrlBuilder.server.deleteAdminAnnouncement(7)).toBe(
      '/userApi/notifications/admin/announcements/7/delete',
    );
  });

  it('builds mark read url', () => {
    expect(notificationApiUrlBuilder.server.read(10)).toBe(
      '/userApi/notifications/10/read',
    );
  });

  it('builds mark all read url', () => {
    expect(notificationApiUrlBuilder.server.readAll()).toBe(
      '/userApi/notifications/read-all',
    );
  });

  it('builds delete url', () => {
    expect(notificationApiUrlBuilder.server.delete(10)).toBe(
      '/userApi/notifications/10',
    );
  });

  it('builds delete read url', () => {
    expect(notificationApiUrlBuilder.server.deleteRead()).toBe(
      '/userApi/notifications/read',
    );
  });

  it('builds recompute unread count url', () => {
    expect(notificationApiUrlBuilder.server.recomputeUnreadCount()).toBe(
      '/userApi/notifications/recompute-unread-count',
    );
  });
});
