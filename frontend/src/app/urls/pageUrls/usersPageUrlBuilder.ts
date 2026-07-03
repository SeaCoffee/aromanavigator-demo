import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

export const userPageUrlBuilder = {
  search: (query?: Query) => build('/users', query),

  publicProfile: (username: string) => build(`/u/${seg(username)}`),

  activity: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/activity`, query),

  followers: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/followers`, query),

  following: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/following`, query),

  articles: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/articles`, query),

  wardrobe: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/wardrobe`, query),

  tasteProfile: (username: string, query?: Query) =>
    build(`/u/${seg(username)}/taste-profile`, query),
} as const;

export const sitePageUrlBuilder = {
  home: () => build('/'),
} as const;
