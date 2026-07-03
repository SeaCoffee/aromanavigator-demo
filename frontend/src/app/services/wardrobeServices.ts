import { anonApi, userApi } from '@/app/services/userApi';
import type { ID, Paginated } from '@/app/types/http';
import type {
  WardrobeCreatePayload,
  WardrobeItem,
  WardrobeListQuery,
  WardrobeUpdatePayload,
} from '@/app/types/wardrobeTypes';
import { wardrobeApiUrlBuilder } from '@/app/urls/wardrobeApiUrlBuilder';

export async function fetchMyWardrobe(query?: WardrobeListQuery) {
  return userApi.get<Paginated<WardrobeItem>>(
    wardrobeApiUrlBuilder.user.me.list(query),
  );
}

export async function fetchMyWardrobeItem(itemId: ID) {
  return userApi.get<WardrobeItem>(
    wardrobeApiUrlBuilder.user.me.detail(itemId),
  );
}

export async function fetchPublicWardrobe(
  displayName: string,
  query?: WardrobeListQuery,
) {
  return anonApi.get<Paginated<WardrobeItem>>(
    wardrobeApiUrlBuilder.anon.public.byDisplayName(displayName, query),
  );
}

export async function createWardrobeItem(payload: WardrobeCreatePayload) {
  return userApi.post<WardrobeItem, WardrobeCreatePayload>(
    wardrobeApiUrlBuilder.user.me.create(),
    { json: payload },
  );
}

export async function updateWardrobeItem(
  itemId: ID,
  payload: WardrobeUpdatePayload,
) {
  return userApi.patch<WardrobeItem, WardrobeUpdatePayload>(
    wardrobeApiUrlBuilder.user.me.update(itemId),
    { json: payload },
  );
}

export async function deleteWardrobeItem(itemId: ID) {
  return userApi.delete<void>(wardrobeApiUrlBuilder.user.me.delete(itemId));
}
