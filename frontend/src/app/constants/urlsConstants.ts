import type { Query } from '@/app/types/http';
import {
  q,
  stripLeadingSlashes,
  stripSlashes,
  stripTrailingSlashes,
} from '@/app/utils/urlUtils';

const PRODUCTION_SITE_URL = 'https://aromanavigator.com.ua';
const LOCAL_SITE_URL = 'http://localhost:3000';
const FALLBACK_SITE_URL =
  process.env.NODE_ENV === 'production' ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;

export const API_BASE =
  stripTrailingSlashes(process.env.NEXT_PUBLIC_API_BASE ?? '') ||
  stripTrailingSlashes(process.env.API_BASE ?? '') ||
  stripTrailingSlashes(process.env.NEXT_PUBLIC_APP_URL ?? '') ||
  stripTrailingSlashes(process.env.NEXTAUTH_URL ?? '') ||
  FALLBACK_SITE_URL;

export const DJANGO_API_ROOT = '/userApi';
export const NEXT_USER_API_ROOT = '/api/userApi';
export const NEXT_ANON_API_ROOT = '/api/anonApi';
export const DJANGO_MEDIA_ROOT = '/media';
export const DJANGO_PUBLIC_MEDIA_ROOT = `${DJANGO_API_ROOT}/media`;
export const NEXT_MEDIA_API_ROOT = '/api/media';

export type ApiRouteScope = 'django' | 'userProxy' | 'anonProxy';

export const apiRouteRoots = {
  django: DJANGO_API_ROOT,
  userProxy: NEXT_USER_API_ROOT,
  anonProxy: NEXT_ANON_API_ROOT,
} as const;

export const apiAppPaths = {
  core: 'core',
  activity: 'activity',
  articles: 'articles',
  auth: 'auth',
  comments: 'comments',
  exchange: 'exchange',
  favorites: 'favorites',
  forum: 'forum',
  fragrance: 'fragrance',
  fragranceUgc: 'fragrance_ugc',
  likes: 'likes',
  notifications: 'notifications',
  photos: 'photos',
  social: 'social',
  tags: 'tags',
  tasteProfile: 'taste-profile',
  users: 'users',
  usersPresence: 'users/presence',
  wardrobe: 'wardrobe',
} as const;

export type ApiAppPath = (typeof apiAppPaths)[keyof typeof apiAppPaths];

function cleanAppPath(appPath: ApiAppPath | string) {
  return stripSlashes(appPath);
}

export function apiRootFor(scope: ApiRouteScope, appPath: ApiAppPath | string) {
  return `${apiRouteRoots[scope]}/${cleanAppPath(appPath)}`;
}

export function apiRootsFor(appPath: ApiAppPath | string) {
  return {
    django: apiRootFor('django', appPath),
    anonProxy: apiRootFor('anonProxy', appPath),
    userProxy: apiRootFor('userProxy', appPath),
  } as const;
}

export const api = (base: string, path = '', query?: Query) => {
  const cleanPath = path ? `/${stripLeadingSlashes(path)}` : '';
  return `${base}${cleanPath}${q(query)}`;
};

export const USER_BASE = apiRootFor('userProxy', apiAppPaths.users);
export const ANON_BASE = apiRootFor('anonProxy', apiAppPaths.users);

export const DJANGO_USER_API_BASE = DJANGO_API_ROOT;
export const DJANGO_ANON_API_BASE = DJANGO_API_ROOT;
export const NEXT_USER_API_BASE = NEXT_USER_API_ROOT;
export const NEXT_ANON_API_BASE = NEXT_ANON_API_ROOT;

export const DJANGO_FORUM_BASE = apiRootFor('django', apiAppPaths.forum);
export const NEXT_FORUM_BASE = apiRootFor('userProxy', apiAppPaths.forum);

export const DJANGO_COMMENTS_BASE = apiRootFor('django', apiAppPaths.comments);
export const NEXT_COMMENTS_BASE = apiRootFor('userProxy', apiAppPaths.comments);

export const DJANGO_LIKES_BASE = apiRootFor('django', apiAppPaths.likes);
export const NEXT_LIKES_BASE = apiRootFor('userProxy', apiAppPaths.likes);

export const DJANGO_TAGS_BASE = apiRootFor('django', apiAppPaths.tags);
export const NEXT_TAGS_BASE = apiRootFor('anonProxy', apiAppPaths.tags);

export const DJANGO_PHOTOS_BASE = apiRootFor('django', apiAppPaths.photos);
export const NEXT_PHOTOS_BASE = apiRootFor('userProxy', apiAppPaths.photos);
