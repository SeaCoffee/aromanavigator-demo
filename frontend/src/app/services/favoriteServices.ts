import { userApi } from '@/app/services/userApi';
import { favoriteApiUrlBuilder } from '@/app/urls/favoriteApiUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  FavoriteItem,
  FavoriteTargetPayload,
  FavoriteToggleResponse,
  PaginatedFavoritesResponse,
} from '@/app/types/favoriteTypes';

export function getMyFavorites(query?: Query) {
  return userApi.get<PaginatedFavoritesResponse>(
    favoriteApiUrlBuilder.user.list(query),
    { cache: 'no-store' },
  );
}

export function createFavorite(payload: FavoriteTargetPayload) {
  return userApi.post<FavoriteItem, FavoriteTargetPayload>(
    favoriteApiUrlBuilder.user.create(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function toggleFavorite(payload: FavoriteTargetPayload) {
  return userApi.post<FavoriteToggleResponse, FavoriteTargetPayload>(
    favoriteApiUrlBuilder.user.toggle(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteFavoriteByTarget(payload: FavoriteTargetPayload) {
  return userApi.delete<void>(
    favoriteApiUrlBuilder.user.deleteByTarget(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteFavorite(favoriteId: number | string) {
  return userApi.delete<void>(
    favoriteApiUrlBuilder.user.delete(favoriteId),
    { cache: 'no-store' },
  );
}
