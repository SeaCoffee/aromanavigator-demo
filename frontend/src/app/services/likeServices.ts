import { userApi } from '@/app/services/userApi';
import { likeUrlBuilder } from '@/app/urls/likeUrlBuilder';
import type { Paginated } from '@/app/types/http';
import type {
  LikeItem,
  LikeTargetPayload,
  LikeToggleResponse,
} from '@/app/types/likeTypes';

export function getMyLikes() {
  return userApi.get<Paginated<LikeItem> | LikeItem[]>(
    likeUrlBuilder.user.list(),
    { cache: 'no-store' },
  );
}

export function createLike(payload: LikeTargetPayload) {
  return userApi.post<LikeItem, LikeTargetPayload>(
    likeUrlBuilder.user.create(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function toggleLike(payload: LikeTargetPayload) {
  return userApi.post<LikeToggleResponse, LikeTargetPayload>(
    likeUrlBuilder.user.toggle(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteLikeByTarget(payload: LikeTargetPayload) {
  return userApi.post<void, LikeTargetPayload>(
    likeUrlBuilder.user.deleteByTarget(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteLike(likeId: number | string) {
  return userApi.delete<void>(
    likeUrlBuilder.user.delete(likeId),
    { cache: 'no-store' },
  );
}
