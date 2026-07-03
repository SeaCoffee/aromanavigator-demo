import type { ID, Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { build, seg } from '@/app/utils/urlUtils';

const SOCIAL_DJANGO_BASE = apiRootFor('django', apiAppPaths.social);
const SOCIAL_USER_PROXY_BASE = apiRootFor('userProxy', apiAppPaths.social);

function createSocialApiBuilder(base: string) {
  return {
    follow: {
      toggle: (userId: ID) => build(`${base}/follow/${seg(userId)}`),
      followers: (userId: ID, query?: Query) =>
        build(`${base}/followers/${seg(userId)}`, query),
      following: (userId: ID, query?: Query) =>
        build(`${base}/following/${seg(userId)}`, query),
    },

    block: {
      toggle: (userId: ID) => build(`${base}/block/${seg(userId)}`),
    },

    state: (userId: ID) => build(`${base}/state/${seg(userId)}`),

    subscriptions: {
      list: (query?: Query) => build(`${base}/subscriptions`, query),
      subscribe: () => build(`${base}/subscribe`),
      unsubscribe: () => build(`${base}/unsubscribe`),
      delete: (subscriptionId: ID) =>
        build(`${base}/subscriptions/${seg(subscriptionId)}`),
    },
  };
}

export const socialApiUrlBuilder = {
  server: createSocialApiBuilder(SOCIAL_DJANGO_BASE),
  user: createSocialApiBuilder(SOCIAL_USER_PROXY_BASE),
} as const;
