// frontend/src/app/urls/pageUrls/__tests__/activityPageUrlBuilder.test.ts

import { describe, expect, it } from 'vitest';

import { activityPageUrlBuilder } from '@/app/urls/pageUrls/activityPageUrlBuilder';

describe('activityPageUrlBuilder', () => {
  it('builds my activity page url', () => {
    expect(activityPageUrlBuilder.me.feed()).toBe('/me/activity');
  });

  it('builds my activity page url with query', () => {
    expect(activityPageUrlBuilder.me.feed({ page: 3 })).toBe(
      '/me/activity?page=3',
    );
  });

  it('builds public user activity page url', () => {
    expect(
      activityPageUrlBuilder.users.byDisplayName('PerfumeFan7999'),
    ).toBe('/u/PerfumeFan7999/activity');
  });
});
