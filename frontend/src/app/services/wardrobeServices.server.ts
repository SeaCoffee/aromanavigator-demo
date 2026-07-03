import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import type { ID, Paginated } from '@/app/types/http';
import type {
  WardrobeCreatePayload,
  WardrobeItem,
  WardrobeListQuery,
  WardrobeUpdatePayload,
} from '@/app/types/wardrobeTypes';
import { wardrobeApiUrlBuilder } from '@/app/urls/wardrobeApiUrlBuilder';

export async function getMyWardrobeServer(query?: WardrobeListQuery) {
  return djangoJson<Paginated<WardrobeItem>>(
    wardrobeApiUrlBuilder.server.me.list(query),
    {
      auth: 'required',
    },
  );
}

export async function getMyWardrobeForFragranceServer(fragranceId: ID) {
  return getMyWardrobeServer({
    fragrance: fragranceId,
    page_size: 20,
  });
}

export async function getMyWardrobeItemServer(itemId: ID) {
  return djangoJson<WardrobeItem>(
    wardrobeApiUrlBuilder.server.me.detail(itemId),
    {
      auth: 'required',
    },
  );
}

export async function getPublicWardrobeServer(
  displayName: string,
  query?: WardrobeListQuery,
) {
  return djangoJson<Paginated<WardrobeItem>>(
    wardrobeApiUrlBuilder.server.public.byDisplayName(displayName, query),
    {
      auth: 'auto',
    },
  );
}

export async function createWardrobeItemServer(payload: WardrobeCreatePayload) {
  return djangoJson<WardrobeItem, WardrobeCreatePayload>(
    wardrobeApiUrlBuilder.server.me.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export async function updateWardrobeItemServer(
  itemId: ID,
  payload: WardrobeUpdatePayload,
) {
  return djangoJson<WardrobeItem, WardrobeUpdatePayload>(
    wardrobeApiUrlBuilder.server.me.update(itemId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export async function deleteWardrobeItemServer(itemId: ID) {
  return djangoJson<void>(
    wardrobeApiUrlBuilder.server.me.delete(itemId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}
