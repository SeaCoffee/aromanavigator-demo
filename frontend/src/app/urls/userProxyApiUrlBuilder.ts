import { q, seg, withRepeatedQuery } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';

type ID = number | string;

const root = apiRootFor('userProxy', apiAppPaths.users);

const api = (path: string, query?: Query) => `${path}${q(query)}`;

export const userProxyApiUrlBuilder = {
  create: () => api(`${root}/register`),

  me: () => api(`${root}/me`),
  updateMe: () => api(`${root}/me/update`),
  deleteSelf: () => api(`${root}/me/delete`),
  changePassword: () => api(`${root}/me/change_password`),
  requestPasswordSetup: () => api(`${root}/me/password/setup`),
  meSuspended: () => api(`${root}/me/suspended`),

  publicList: (query?: Query) => api(`${root}/list`, query),
  search: (query?: Query) => api(`${root}/search`, query),
  byUsername: (username: string) => api(`${root}/u/${seg(username)}`),

  byLookup: (value: ID) => api(`${root}/by/${seg(value)}`),
  filtered: (query?: Query) => api(`${root}/filtered`, query),
  adminList: (query?: Query) => api(`${root}/admin-list`, query),

  presenceBulk: (ids: ID[]) => withRepeatedQuery(`${root}/presence`, 'ids', ids),
  presenceHeartbeat: () => api(`${root}/presence/heartbeat`),

  suspend: (id: ID) => api(`${root}/${seg(id)}/suspend`),
  unsuspend: (id: ID) => api(`${root}/${seg(id)}/unsuspend`),

  block: (id: ID) => api(`${root}/${seg(id)}/block`),
  unblock: (id: ID) => api(`${root}/${seg(id)}/unblock`),

  toAdmin: (id: ID) => api(`${root}/${seg(id)}/to_admin`),
  toModerator: (id: ID) => api(`${root}/${seg(id)}/to_moderator`),
  toUser: (id: ID) => api(`${root}/${seg(id)}/to_user`),
} as const;
