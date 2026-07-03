import "server-only";

import { djangoJson } from "@/app/services/djangoClient.server";
import {
  getPresenceBulkServer,
  sendPresenceHeartbeatServer,
} from "@/app/services/presenceServices.server";
import { userDjangoApiUrlBuilder } from "@/app/urls/userDjangoApiUrlBuilder";
import type { ApiMessage } from "@/app/types/authTypes";
import type { RegisterPayload } from "@/app/types/formTypes";
import type { Query } from "@/app/types/http";
import type {
  AdminUserListItem,
  ChangePasswordPayload,
  ID,
  MeSuspendedResponse,
  Paginated,
  PublicUser,
  SuspendUserPayload,
  SuspendUserResponse,
  UnsuspendUserResponse,
  UpdateMePayload,
  UpdateMeResponse,
  UserDetail,
  UserMe,
} from "@/app/types/userTypes";
import { normalizePublicUsername } from "@/app/utils/userDisplayUtils";

// вЂ”вЂ”вЂ” me вЂ”вЂ”вЂ”

export const getMeServer = () =>
  djangoJson<UserMe>(userDjangoApiUrlBuilder.me(), {
    method: "GET",
    auth: "required",
  });

export const updateSelfServer = (payload: UpdateMePayload) =>
  djangoJson<UpdateMeResponse, UpdateMePayload>(
    userDjangoApiUrlBuilder.updateMe(),
    {
      method: "PATCH",
      auth: "required",
      json: payload,
    },
  );

export const deleteSelfServer = () =>
  djangoJson<void>(userDjangoApiUrlBuilder.deleteSelf(), {
    method: "DELETE",
    auth: "required",
  });

export const changePasswordServer = (payload: ChangePasswordPayload) =>
  djangoJson<ApiMessage, ChangePasswordPayload>(
    userDjangoApiUrlBuilder.changePassword(),
    {
      method: "POST",
      auth: "required",
      json: payload,
    },
  );

export const requestPasswordSetupServer = () =>
  djangoJson<ApiMessage>(userDjangoApiUrlBuilder.requestPasswordSetup(), {
    method: "POST",
    auth: "required",
  });

export const getMeSuspendedServer = () =>
  djangoJson<MeSuspendedResponse>(userDjangoApiUrlBuilder.meSuspended(), {
    method: "GET",
    auth: "required",
  });

// вЂ”вЂ”вЂ” public вЂ”вЂ”вЂ”

export const createUserServer = (payload: RegisterPayload) =>
  djangoJson<UserMe, RegisterPayload>(userDjangoApiUrlBuilder.create(), {
    method: "POST",
    auth: "none",
    json: payload,
  });

export const getPublicUserByUsernameServer = (username: string) =>
  djangoJson<PublicUser>(
    userDjangoApiUrlBuilder.byUsername(normalizePublicUsername(username)),
    {
      method: "GET",
      auth: "auto",
    },
  );

export const searchPublicUsersServer = (params?: Query) =>
  djangoJson<Paginated<PublicUser>>(userDjangoApiUrlBuilder.search(params), {
    method: "GET",
    auth: "auto",
  });

export const listPublicUsersServer = (params?: Query) =>
  djangoJson<Paginated<PublicUser>>(
    userDjangoApiUrlBuilder.publicList(params),
    {
      method: "GET",
      auth: "auto",
    },
  );

// вЂ”вЂ”вЂ” admin / private вЂ”вЂ”вЂ”

export const getUserByLookupServer = (value: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.byLookup(value), {
    method: "GET",
    auth: "required",
  });

export const listUsersFilteredServer = (params?: Query) =>
  djangoJson<Paginated<UserDetail>>(userDjangoApiUrlBuilder.filtered(params), {
    method: "GET",
    auth: "required",
  });

export const listUsersAdminServer = (params?: Query) =>
  djangoJson<Paginated<AdminUserListItem>>(
    userDjangoApiUrlBuilder.adminList(params),
    {
      method: "GET",
      auth: "required",
    },
  );

// вЂ”вЂ”вЂ” presence вЂ”вЂ”вЂ”

export const presenceBulkServer = (ids: ID[]) => getPresenceBulkServer(ids);

export const presenceHeartbeatServer = () => sendPresenceHeartbeatServer();

// вЂ”вЂ”вЂ” moderation / roles вЂ”вЂ”вЂ”

export const adminSuspendUserServer = (id: ID, payload: SuspendUserPayload) =>
  djangoJson<SuspendUserResponse, SuspendUserPayload>(
    userDjangoApiUrlBuilder.suspend(id),
    {
      method: "PATCH",
      auth: "required",
      json: payload,
    },
  );

export const adminUnsuspendUserServer = (id: ID) =>
  djangoJson<UnsuspendUserResponse>(userDjangoApiUrlBuilder.unsuspend(id), {
    method: "PATCH",
    auth: "required",
  });

export const adminBlockUserServer = (id: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.block(id), {
    method: "PATCH",
    auth: "required",
  });

export const adminUnblockUserServer = (id: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.unblock(id), {
    method: "PATCH",
    auth: "required",
  });

export const promoteToAdminServer = (id: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.toAdmin(id), {
    method: "PATCH",
    auth: "required",
  });

export const promoteToModeratorServer = (id: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.toModerator(id), {
    method: "PATCH",
    auth: "required",
  });

export const demoteToUserServer = (id: ID) =>
  djangoJson<AdminUserListItem>(userDjangoApiUrlBuilder.toUser(id), {
    method: "PATCH",
    auth: "required",
  });
