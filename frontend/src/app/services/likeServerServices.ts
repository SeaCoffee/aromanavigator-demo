import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { likeUrlBuilder } from '@/app/urls/likeUrlBuilder';
import type { Paginated } from '@/app/types/http';
import type {
  LikeItem,
  LikeTargetPayload,
  LikeToggleResponse,
} from '@/app/types/likeTypes';

export function getMyLikesServer() {
  return djangoJson<Paginated<LikeItem> | LikeItem[]>(
    likeUrlBuilder.server.list(),
    {
      method: 'GET',
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export function createLikeServer(payload: LikeTargetPayload) {
  return djangoJson<LikeItem, LikeTargetPayload>(
    likeUrlBuilder.server.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export function toggleLikeServer(payload: LikeTargetPayload) {
  return djangoJson<LikeToggleResponse, LikeTargetPayload>(
    likeUrlBuilder.server.toggle(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteLikeByTargetServer(payload: LikeTargetPayload) {
  return djangoJson<void, LikeTargetPayload>(
    likeUrlBuilder.server.deleteByTarget(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteLikeServer(likeId: number | string) {
  return djangoJson<void>(
    likeUrlBuilder.server.delete(likeId),
    {
      method: 'DELETE',
      auth: 'required',
      cache: 'no-store',
    },
  );
}
