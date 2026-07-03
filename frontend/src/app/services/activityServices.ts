import { anonApi, userApi } from '@/app/services/userApi';
import type {
  ActivityEvent,
  PaginatedResponse,
} from '@/app/types/activityTypes';
import type { ID, Query } from '@/app/types/http';
import { activityApiUrlBuilder } from '@/app/urls/activityApiUrlBuilder';

export function getMyActivityFeed(query?: Query) {
  return userApi.get<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.user.feed(query),
    { cache: 'no-store' },
  );
}

export function getPublicActivityFeed(query?: Query) {
  return anonApi.get<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.anon.publicFeed(query),
    { cache: 'no-store' },
  );
}

export function getUserActivityFeed(userId: ID, query?: Query) {
  return anonApi.get<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.anon.userFeed(userId, query),
    { cache: 'no-store' },
  );
}

export function getUserActivityFeedByDisplayName(
  displayName: string,
  query?: Query,
) {
  return anonApi.get<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.anon.userFeedByDisplayName(displayName, query),
    { cache: 'no-store' },
  );
}

export function getTargetActivityFeed(
  app: string,
  model: string,
  objectId: ID,
  query?: Query,
) {
  return anonApi.get<PaginatedResponse<ActivityEvent>>(
    activityApiUrlBuilder.anon.targetFeed(app, model, objectId, query),
    { cache: 'no-store' },
  );
}
