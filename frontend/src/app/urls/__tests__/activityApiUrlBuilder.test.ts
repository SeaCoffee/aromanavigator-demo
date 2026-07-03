// frontend/src/app/urls/apiUrls/__tests__/activityApiUrlBuilder.test.ts

import { describe, expect, it } from 'vitest';

import { activityApiUrlBuilder } from '@/app/urls/activityApiUrlBuilder';

describe('activityApiUrlBuilder', () => {
  it('builds my feed url', () => {
    expect(activityApiUrlBuilder.server.feed()).toBe('/userApi/activity/feed');
  });

  it('builds my feed url with query', () => {
    expect(activityApiUrlBuilder.server.feed({ page: 2, verb: 'liked' })).toBe(
      '/userApi/activity/feed?page=2&verb=liked',
    );
  });

  it('builds public feed url', () => {
    expect(activityApiUrlBuilder.server.publicFeed()).toBe('/userApi/activity/public');
  });

  it('builds user feed by display name url', () => {
    expect(
      activityApiUrlBuilder.server.userFeedByDisplayName('PerfumeFan7999'),
    ).toBe('/userApi/activity/user/by-display-name/PerfumeFan7999');
  });

  it('encodes display name safely', () => {
    expect(
      activityApiUrlBuilder.server.userFeedByDisplayName('@Perfume Fan'),
    ).toBe('/userApi/activity/user/by-display-name/%40Perfume%20Fan');
  });

  it('builds target feed url', () => {
    expect(
      activityApiUrlBuilder.server.targetFeed('forum', 'forumtopicmodel', 10),
    ).toBe('/userApi/activity/target/forum/forumtopicmodel/10');
  });
});
