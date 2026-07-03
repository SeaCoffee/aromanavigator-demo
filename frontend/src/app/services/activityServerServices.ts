// frontend/src/app/services/activityServerServices.ts

import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { activityApiUrlBuilder } from '@/app/urls/activityApiUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  ActivityEvent,
  PaginatedResponse,
} from '@/app/types/activityTypes';

export async function getMyActivityFeedServer(query?: Query) {
  return djangoJson<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.server.feed(query),
    { auth: 'required' },
  );
}

export async function getPublicActivityFeedServer(query?: Query) {
  return djangoJson<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.server.publicFeed(query),
    { auth: 'none' },
  );
}

export async function getUserActivityFeedByDisplayNameServer(
  displayName: string,
  query?: Query,
) {
  return djangoJson<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.server.userFeedByDisplayName(displayName, query),
    { auth: 'none' },
  );
}

export async function getTargetActivityFeedServer(
  app: string,
  model: string,
  objectId: number | string,
  query?: Query,
) {
  return djangoJson<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.server.targetFeed(app, model, objectId, query),
    { auth: 'none' },
  );
}
