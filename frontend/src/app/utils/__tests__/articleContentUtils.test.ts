import { describe, expect, it } from 'vitest';

import {
  articleContentBlocks,
  removeArticlePhoto,
  removePendingArticlePhoto,
  replacePendingArticlePhotoTokens,
  stripArticlePhotoTokens,
  unusedArticlePhotos,
} from '@/app/utils/articleContentUtils';

const photos = [
  { id: 10, image: '/10.jpg', position: 1 },
  { id: 11, image: '/11.jpg', position: 2 },
];

describe('articleContentUtils', () => {
  it('replaces pending upload markers with stored photo ids', () => {
    expect(
      replacePendingArticlePhotoTokens(
        'Р”Рѕ\n[[article-upload:1]]\nРџС–СЃР»СЏ',
        photos,
      ),
    ).toBe('Р”Рѕ\n[[article-photo:11]]\nРџС–СЃР»СЏ');
  });

  it('keeps pending markers consistent after removing a selected image', () => {
    expect(
      removePendingArticlePhoto(
        '[[article-upload:0]] [[article-upload:1]] [[article-upload:2]]',
        1,
      ),
    ).toBe('[[article-upload:0]]  [[article-upload:1]]');
  });

  it('removes every token for a deleted stored photo', () => {
    expect(
      removeArticlePhoto(
        'Р”Рѕ [[article-photo:10]] РјС–Р¶ [[article-photo:10]] РїС–СЃР»СЏ',
        10,
      ),
    ).toBe('Р”Рѕ  РјС–Р¶  РїС–СЃР»СЏ');
  });

  it('builds safe text and owned-photo blocks', () => {
    expect(
      articleContentBlocks(
        'РџРѕС‡Р°С‚РѕРє [[article-photo:10]] РєС–РЅРµС†СЊ [[article-photo:999]]',
        photos,
      ),
    ).toEqual([
      { kind: 'text', value: 'РџРѕС‡Р°С‚РѕРє ' },
      { kind: 'photo', photo: photos[0] },
      { kind: 'text', value: ' РєС–РЅРµС†СЊ ' },
    ]);
  });

  it('removes markers from excerpts and finds unused photos', () => {
    expect(stripArticlePhotoTokens('Р”Рѕ [[article-photo:10]] РїС–СЃР»СЏ')).toBe(
      'Р”Рѕ РїС–СЃР»СЏ',
    );
    expect(unusedArticlePhotos('[[article-photo:10]]', photos)).toEqual([
      photos[1],
    ]);
  });
});
