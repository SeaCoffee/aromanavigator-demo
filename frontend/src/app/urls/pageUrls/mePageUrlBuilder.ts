import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';

export const mePageUrlBuilder = {
  home: () => build('/me'),

  followers: (query?: Query) => build('/me/followers', query),
  following: (query?: Query) => build('/me/following', query),
  subscriptions: (query?: Query) => build('/me/subscriptions', query),

  users: {
  search: (query?: Query) => build('/me/users', query),
},

  activity: {
    feed: (query?: Query) => build('/me/activity', query),
  },

  notifications: {
    list: (query?: Query) => build('/me/notifications', query),
  },

  favorites: {
    list: (query?: Query) => build('/me/favorites', query),
  },

  articles: {
    list: (query?: Query) => build('/me/articles', query),
    create: () => build('/me/articles/create'),
    edit: (id: number | string) => build(`/me/articles/${seg(id)}/edit`),
  },

  wardrobe: {
    list: (query?: Query) => build('/me/wardrobe', query),
    create: () => build('/me/wardrobe/create'),
    edit: (id: number | string) => build(`/me/wardrobe/${seg(id)}/edit`),
  },

  perfumeProfile: {
    detail: (query?: Query) => build('/me/perfume-profile', query),
  },

  exchange: {
    list: (query?: Query) => build('/me/exchange', query),
    sent: (query?: Query) => build('/me/exchange/sent', query),
    received: (query?: Query) => build('/me/exchange/received', query),
  },

  profile: {
    edit: () => build('/me/profile'),
    security: () => build('/me/security'),
    delete: () => build('/me/profile/delete'),
  },


} as const;
