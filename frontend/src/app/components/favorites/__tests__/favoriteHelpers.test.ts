import { describe, expect, it } from 'vitest';

import {
  getFavoriteItemImage,
  getFavoriteItemMeta,
  getFavoriteItemTitle,
} from '@/app/components/favorites/favoriteHelpers';

describe('favoriteHelpers', () => {
  it('returns title from title field', () => {
    expect(getFavoriteItemTitle({ title: 'Dior Sauvage' })).toBe('Dior Sauvage');
  });

  it('returns title from name field', () => {
    expect(getFavoriteItemTitle({ name: 'Chanel No. 5' })).toBe('Chanel No. 5');
  });

  it('returns brand name as fallback', () => {
    expect(getFavoriteItemTitle({ brand: { name: 'Guerlain' } })).toBe('Guerlain');
  });

  it('returns object fallback', () => {
    expect(
      getFavoriteItemTitle({
        app: 'fragrance',
        model: 'fragrancemodel',
        id: 1,
      }),
    ).toBe('РђСЂРѕРјР°С‚');
  });

  it('returns cover image first', () => {
    expect(
      getFavoriteItemImage({
        cover_image: '/cover.jpg',
        image_url: '/image.jpg',
      }),
    ).toBe('/cover.jpg');
  });

  it('normalizes protected media image urls', () => {
    expect(
      getFavoriteItemImage({
        cover_image:
          '/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg',
      }),
    ).toBe('/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg');
  });

  it('returns frontend entity meta', () => {
    expect(
      getFavoriteItemMeta({
        app: 'fragrance',
        model: 'fragrancemodel',
      }),
    ).toBe('РђСЂРѕРјР°С‚');
  });
});
