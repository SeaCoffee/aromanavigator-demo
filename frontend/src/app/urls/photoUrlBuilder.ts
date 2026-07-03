import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { q, seg } from '@/app/utils/urlUtils';

const api = (path: string, query?: Query) => `${path}${q(query)}`;

const PHOTO_DJANGO_BASE = apiRootFor('django', apiAppPaths.photos);
const PHOTO_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.photos);

function createPhotoApiBuilder(base: string) {
  return {
    object: {
      photos: {
        detail: (app: string, model: string, objectId: ID) =>
          api(`${base}/object/${seg(app)}/${seg(model)}/${seg(objectId)}`),
      },

      cover: {
        set: () => api(`${base}/object/cover`),
        modList: (query?: Query) => api(`${base}/object/cover/mod`, query),
        delete: (coverId: ID) =>
          api(`${base}/object/cover/${seg(coverId)}/delete`),
      },

      attachments: {
        add: () => api(`${base}/object/attachments`),
        modList: (query?: Query) => api(`${base}/object/mod`, query),
        delete: (photoId: ID) => api(`${base}/object/${seg(photoId)}/delete`),
      },
    },

    perfume: {
      single: (model: string, objectId: ID) =>
        api(`${base}/${seg(model)}/${seg(objectId)}/single`),

      bulk: (model: string, objectId: ID) =>
        api(`${base}/${seg(model)}/${seg(objectId)}/bulk`),

      delete: (photoId: ID) => api(`${base}/${seg(photoId)}/delete`),
    },
  };
}

export const photoApiUrlBuilder = {
  server: createPhotoApiBuilder(PHOTO_DJANGO_BASE),
  user: createPhotoApiBuilder(PHOTO_USER_PROXY_BASE),
} as const;

export const photoPageUrlBuilder = {
  anchors: {
    photos: 'photos',
    cover: 'cover',
    attachments: 'attachments',
  },

  withPhotosAnchor: (pagePath: string) => `${pagePath}#photos`,
  withCoverAnchor: (pagePath: string) => `${pagePath}#cover`,
  withAttachmentsAnchor: (pagePath: string) => `${pagePath}#attachments`,
} as const;
