import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import type { ID } from '@/app/types/http';
import type { PresenceBulkResponse } from '@/app/types/userTypes';
import { presenceApiUrlBuilder } from '@/app/urls/presenceApiUrlBuilder';

export function getPresenceBulkServer(ids: ID[]) {
  return djangoJson<PresenceBulkResponse>(presenceApiUrlBuilder.server.bulk(ids), {
    method: 'GET',
    auth: 'required',
  });
}

export function sendPresenceHeartbeatServer() {
  return djangoJson<void>(presenceApiUrlBuilder.server.heartbeat(), {
    method: 'POST',
    auth: 'required',
  });
}
