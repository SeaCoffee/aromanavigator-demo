import { describe, expect, it } from 'vitest';

import {
  normalizeMediaUrl,
  pickMediaUrl,
  toProtectedNextApiUrl,
} from '@/app/utils/MediaUrlUtils';

describe('toProtectedNextApiUrl', () => {
  it('keeps existing Next proxy URL', () => {
    expect(
      toProtectedNextApiUrl('/api/userApi/photos/private/1/file'),
    ).toBe('/api/userApi/photos/private/1/file');
  });

  it('converts relative Django userApi URL', () => {
    expect(
      toProtectedNextApiUrl('/userApi/photos/private/1/file'),
    ).toBe('/api/userApi/photos/private/1/file');
  });

  it('converts absolute Django userApi URL', () => {
    expect(
      toProtectedNextApiUrl(
        'http://localhost:8888/userApi/photos/private/1/file',
      ),
    ).toBe('/api/userApi/photos/private/1/file');
  });

  it('converts relative Django media URL', () => {
    expect(
      toProtectedNextApiUrl('/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg'),
    ).toBe('/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg');
  });

  it('converts absolute Django media URL', () => {
    expect(
      toProtectedNextApiUrl(
        'http://localhost:8888/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg',
      ),
    ).toBe('/userApi/media/photos/covers/fragrance/fragrancemodel/1/a.jpg');
  });

  it('converts plain Django media URL', () => {
    expect(toProtectedNextApiUrl('/media/public.jpg')).toBe('/userApi/media/public.jpg');
  });

  it('converts legacy Next media proxy URL to the public media endpoint', () => {
    expect(toProtectedNextApiUrl('/api/media/public.jpg')).toBe(
      '/userApi/media/public.jpg',
    );
  });

  it('normalizes empty media urls', () => {
    expect(normalizeMediaUrl(null)).toBe('');
    expect(normalizeMediaUrl('')).toBe('');
  });

  it('picks media url from cover image and photos', () => {
    expect(
      pickMediaUrl({
        cover_image: '',
        photos: [{ image: '/userApi/media/offers/1.jpg' }],
      }),
    ).toBe('/userApi/media/offers/1.jpg');
  });

  it('picks nested cover image before generic image', () => {
    expect(
      pickMediaUrl({
        cover: { image: '/userApi/media/covers/1.jpg' },
        image: '/userApi/media/images/1.jpg',
      }),
    ).toBe('/userApi/media/covers/1.jpg');
  });
});
