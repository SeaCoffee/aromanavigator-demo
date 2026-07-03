import { describe, expect, it } from 'vitest';

import { commentApiUrlBuilder } from '@/app/urls/commentUrlBuilder';

describe('commentApiUrlBuilder', () => {
  it('keeps the Django collection trailing slash', () => {
    expect(commentApiUrlBuilder.server.list()).toBe('/userApi/comments/');
    expect(commentApiUrlBuilder.server.create()).toBe('/userApi/comments/');
  });

  it('builds canonical thread and detail URLs', () => {
    expect(
      commentApiUrlBuilder.server.thread({
        app: 'fragrance',
        model: 'fragrancemodel',
        id: 26,
      }),
    ).toBe(
      '/userApi/comments/thread?app=fragrance&model=fragrancemodel&id=26',
    );
    expect(commentApiUrlBuilder.server.detail(7)).toBe('/userApi/comments/7');
  });

  it('keeps proxy collection URLs aligned with the Django route', () => {
    expect(commentApiUrlBuilder.anon.list()).toBe('/api/anonApi/comments/');
    expect(commentApiUrlBuilder.user.create()).toBe('/api/userApi/comments/');
  });
});
