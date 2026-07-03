import { anonApi, userApi } from '@/app/services/userApi';
import { userAnonApiUrlBuilder } from '@/app/urls/userAnonApiUrlBuilder';
import { userProxyApiUrlBuilder } from '@/app/urls/userProxyApiUrlBuilder';
import type { ApiMessage } from '@/app/types/authTypes';
import type { RegisterPayload } from '@/app/types/formTypes';
import type { Query } from '@/app/types/http';
import type {
  AdminUserListItem,
  ChangePasswordPayload,
  ID,
  MeSuspendedResponse,
  Paginated,
  PresenceBulkResponse,
  PublicUser,
  SuspendUserPayload,
  SuspendUserResponse,
  UnsuspendUserResponse,
  UpdateMePayload,
  UpdateMeResponse,
  UserDetail,
  UserMe,
} from '@/app/types/userTypes';
import { normalizePublicUsername } from '@/app/utils/userDisplayUtils';

// вЂ”вЂ”вЂ” me вЂ”вЂ”вЂ”

export const getMe = () =>
  userApi.get<UserMe>(userProxyApiUrlBuilder.me(), {
    cache: 'no-store',
  });

export const updateSelf = (payload: UpdateMePayload) =>
  userApi.patch<UpdateMeResponse, UpdateMePayload>(
    userProxyApiUrlBuilder.updateMe(),
    {
      json: payload,
      cache: 'no-store',
    },
  );

export const deleteSelf = () =>
  userApi.delete<void>(userProxyApiUrlBuilder.deleteSelf(), {
    cache: 'no-store',
  });

export const changePassword = (payload: ChangePasswordPayload) =>
  userApi.post<ApiMessage, ChangePasswordPayload>(
    userProxyApiUrlBuilder.changePassword(),
    {
      json: payload,
      cache: 'no-store',
    },
  );

export const getMeSuspended = () =>
  userApi.get<MeSuspendedResponse>(userProxyApiUrlBuilder.meSuspended(), {
    cache: 'no-store',
  });

// вЂ”вЂ”вЂ” public вЂ”вЂ”вЂ”

export const getPublicUserByUsername = (username: string) =>
  anonApi.get<PublicUser>(
    userAnonApiUrlBuilder.byUsername(normalizePublicUsername(username)),
    {
      cache: 'no-store',
    },
  );

export const searchPublicUsers = (params?: Query) =>
  anonApi.get<Paginated<PublicUser>>(userAnonApiUrlBuilder.search(params), {
    cache: 'no-store',
  });

export const listPublicUsers = (params?: Query) =>
  anonApi.get<Paginated<PublicUser>>(userAnonApiUrlBuilder.publicList(params), {
    cache: 'no-store',
  });

export const createUser = (payload: RegisterPayload) =>
  anonApi.post<UserMe, RegisterPayload>(userAnonApiUrlBuilder.create(), {
    json: payload,
    cache: 'no-store',
  });

// вЂ”вЂ”вЂ” admin / private вЂ”вЂ”вЂ”

export const getUserByLookup = (value: ID) =>
  userApi.get<UserDetail>(userProxyApiUrlBuilder.byLookup(value), {
    cache: 'no-store',
  });

export const listUsersFiltered = (params?: Query) =>
  userApi.get<Paginated<UserDetail>>(userProxyApiUrlBuilder.filtered(params), {
    cache: 'no-store',
  });

export const listUsersAdmin = (params?: Query) =>
  userApi.get<Paginated<AdminUserListItem>>(
    userProxyApiUrlBuilder.adminList(params),
    {
      cache: 'no-store',
    },
  );

// вЂ”вЂ”вЂ” presence вЂ”вЂ”вЂ”

export const presenceBulk = (ids: ID[]) =>
  userApi.safeGet<PresenceBulkResponse>(
    userProxyApiUrlBuilder.presenceBulk(ids),
    {
      cache: 'no-store',
    },
  );

export const presenceHeartbeat = () =>
  userApi.safePost<void>(userProxyApiUrlBuilder.presenceHeartbeat(), {
    cache: 'no-store',
  });

export const presencePing = (id: ID) => presenceBulk([id]);

// вЂ”вЂ”вЂ” moderation / roles вЂ”вЂ”вЂ”

export const adminSuspendUser = (id: ID, payload: SuspendUserPayload) =>
  userApi.patch<SuspendUserResponse, SuspendUserPayload>(
    userProxyApiUrlBuilder.suspend(id),
    {
      json: payload,
      cache: 'no-store',
    },
  );

export const adminUnsuspendUser = (id: ID) =>
  userApi.patch<UnsuspendUserResponse>(userProxyApiUrlBuilder.unsuspend(id), {
    cache: 'no-store',
  });

export const adminBlockUser = (id: ID) =>
  userApi.patch<AdminUserListItem>(userProxyApiUrlBuilder.block(id), {
    cache: 'no-store',
  });

export const adminUnblockUser = (id: ID) =>
  userApi.patch<AdminUserListItem>(userProxyApiUrlBuilder.unblock(id), {
    cache: 'no-store',
  });

export const promoteToAdmin = (id: ID) =>
  userApi.patch<AdminUserListItem>(userProxyApiUrlBuilder.toAdmin(id), {
    cache: 'no-store',
  });

export const promoteToModerator = (id: ID) =>
  userApi.patch<AdminUserListItem>(userProxyApiUrlBuilder.toModerator(id), {
    cache: 'no-store',
  });

export const demoteToUser = (id: ID) =>
  userApi.patch<AdminUserListItem>(userProxyApiUrlBuilder.toUser(id), {
    cache: 'no-store',
  });
