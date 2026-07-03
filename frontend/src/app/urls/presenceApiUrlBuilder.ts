import type { ID } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { withRepeatedQuery } from '@/app/utils/urlUtils';

const PRESENCE_DJANGO_BASE = apiRootFor('django', apiAppPaths.usersPresence);
const PRESENCE_USER_PROXY_BASE = apiRootFor(
  'userProxy',
  apiAppPaths.usersPresence,
);

function createPresenceApiBuilder(base: string) {
  return {
    bulk: (ids: ID[]) => withRepeatedQuery(base, 'ids', ids),
    heartbeat: () => `${base}/heartbeat`,
  };
}

export const presenceApiUrlBuilder = {
  server: createPresenceApiBuilder(PRESENCE_DJANGO_BASE),
  user: createPresenceApiBuilder(PRESENCE_USER_PROXY_BASE),
} as const;
