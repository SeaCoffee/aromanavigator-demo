import { describe, expect, it } from 'vitest';

import { notificationApiUrlBuilder } from '@/app/urls/notificationApiUrlBuilder';

describe('notificationApiUrlBuilder.user', () => {
  it('builds proxy notifications list url', () => {
    expect(notificationApiUrlBuilder.user.list()).toBe(
      '/api/userApi/notifications/',
    );
  });

  it('builds proxy notifications list url with query', () => {
    expect(
      notificationApiUrlBuilder.user.list({
        page: 2,
        is_read: false,
      }),
    ).toBe('/api/userApi/notifications/?page=2&is_read=false');
  });

  it('builds proxy unread count url', () => {
    expect(notificationApiUrlBuilder.user.unreadCount()).toBe(
      '/api/userApi/notifications/unread-count',
    );
  });

  it('builds proxy announcement urls', () => {
    expect(notificationApiUrlBuilder.user.announcements()).toBe(
      '/api/userApi/notifications/announcements',
    );
    expect(notificationApiUrlBuilder.user.readAnnouncement(7)).toBe(
      '/api/userApi/notifications/announcements/7/read',
    );
  });

  it('builds proxy admin announcement urls', () => {
    expect(notificationApiUrlBuilder.user.adminAnnouncements()).toBe(
      '/api/userApi/notifications/admin/announcements',
    );
    expect(notificationApiUrlBuilder.user.createAdminAnnouncement()).toBe(
      '/api/userApi/notifications/admin/announcements',
    );
  });

  it('builds proxy mark read url', () => {
    expect(notificationApiUrlBuilder.user.read(10)).toBe(
      '/api/userApi/notifications/10/read',
    );
  });

  it('builds proxy delete url', () => {
    expect(notificationApiUrlBuilder.user.delete(10)).toBe(
      '/api/userApi/notifications/10',
    );
  });
});
