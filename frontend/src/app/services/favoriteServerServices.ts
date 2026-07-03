import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { favoriteApiUrlBuilder } from '@/app/urls/favoriteApiUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  FavoriteItem,
  FavoriteTargetPayload,
  FavoriteToggleResponse,
  PaginatedFavoritesResponse,
} from '@/app/types/favoriteTypes';

export async function getMyFavoritesServer(query?: Query) {
  return djangoJson<PaginatedFavoritesResponse>(
    favoriteApiUrlBuilder.server.list(query),
    {
      method: 'GET',
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export async function createFavoriteServer(payload: FavoriteTargetPayload) {
  return djangoJson<FavoriteItem, FavoriteTargetPayload>(
    favoriteApiUrlBuilder.server.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export async function toggleFavoriteServer(payload: FavoriteTargetPayload) {
  return djangoJson<FavoriteToggleResponse, FavoriteTargetPayload>(
    favoriteApiUrlBuilder.server.toggle(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export async function deleteFavoriteByTargetServer(payload: FavoriteTargetPayload) {
  return djangoJson<void, FavoriteTargetPayload>(
    favoriteApiUrlBuilder.server.deleteByTarget(),
    {
      method: 'DELETE',
      auth: 'required',
      json: payload,
      cache: 'no-store',
    },
  );
}

export async function deleteFavoriteServer(favoriteId: number | string) {
  return djangoJson<void>(favoriteApiUrlBuilder.server.delete(favoriteId), {
    method: 'DELETE',
    auth: 'required',
    cache: 'no-store',
  });
}
