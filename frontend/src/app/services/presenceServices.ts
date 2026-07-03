import { userApi } from '@/app/services/userApi';
import type { ID } from '@/app/types/http';
import type { PresenceBulkResponse } from '@/app/types/userTypes';
import { presenceApiUrlBuilder } from '@/app/urls/presenceApiUrlBuilder';

export function fetchPresenceBulk(ids: ID[]) {
  return userApi.safeGet<PresenceBulkResponse>(
    presenceApiUrlBuilder.user.bulk(ids),
  );
}

export function sendPresenceHeartbeat() {
  return userApi.safePost<void>(presenceApiUrlBuilder.user.heartbeat());
}
