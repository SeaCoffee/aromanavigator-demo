import { build, seg } from '@/app/utils/urlUtils';
import type { ID } from '@/app/types/http';
import { DJANGO_PHOTOS_BASE } from '@/app/constants/urlsConstants';

export const objectPhotoDjangoApiUrlBuilder = {
  cover: {
    set: () => build(`${DJANGO_PHOTOS_BASE}/object/cover`),

    delete: (coverId: ID) =>
      build(`${DJANGO_PHOTOS_BASE}/object/cover/${seg(coverId)}/delete`),
  },

  attachments: {
    add: () => build(`${DJANGO_PHOTOS_BASE}/object/attachments`),

    delete: (photoId: ID) =>
      build(`${DJANGO_PHOTOS_BASE}/object/${seg(photoId)}/delete`),
  },
} as const;
