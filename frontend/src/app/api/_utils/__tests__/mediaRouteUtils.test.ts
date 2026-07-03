import { describe, expect, it } from 'vitest';

import { buildDjangoMediaPath } from '@/app/api/_utils/mediaRouteUtils';

describe('buildDjangoMediaPath', () => {
  it('maps public Next media path to Django media endpoint', () => {
    expect(
      buildDjangoMediaPath([
        'photos',
        'covers',
        'articles',
        'article',
        '3',
        'cover.jpg',
      ]),
    ).toBe('/userApi/media/photos/covers/articles/article/3/cover.jpg');
  });

  it('encodes safe path segments', () => {
    expect(buildDjangoMediaPath(['photos', 'С„РѕС‚Рѕ 1.jpg'])).toBe(
      '/userApi/media/photos/%D1%84%D0%BE%D1%82%D0%BE%201.jpg',
    );
  });

  it.each([
    [[]],
    [['photos', '..', 'secret.jpg']],
    [['photos', '.', 'file.jpg']],
    [['photos', 'nested/file.jpg']],
    [['photos', 'nested\\file.jpg']],
  ])('rejects unsafe media path %j', (path) => {
    expect(buildDjangoMediaPath(path)).toBeNull();
  });
});
