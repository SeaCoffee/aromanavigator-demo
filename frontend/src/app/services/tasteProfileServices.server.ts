import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import type { ID } from '@/app/types/http';
import type {
  TastePreferenceCreateInput,
  TastePreferenceKind,
  TastePreferenceUpdateInput,
  TasteProfile,
  TasteProfileUpdateInput,
} from '@/app/types/tasteProfileTypes';
import { tasteProfileDjangoApiUrlBuilder } from '@/app/urls/tasteProfileDjangoApiUrlBuilder';

type TastePreferenceResponse = unknown;

function preferenceBuilder(kind: TastePreferenceKind) {
  return tasteProfileDjangoApiUrlBuilder.preferences[kind];
}

function stripKind(payload: TastePreferenceCreateInput) {
  const { kind: _kind, ...data } = payload;
  return data;
}

export async function getMyTasteProfileServer() {
  return djangoJson<TasteProfile>(
    tasteProfileDjangoApiUrlBuilder.me.detail(),
    { auth: 'required' },
  );
}

export async function getPublicTasteProfileServer(displayName: string) {
  return djangoJson<TasteProfile>(
    tasteProfileDjangoApiUrlBuilder.public.byDisplayName(displayName),
    { auth: 'auto' },
  );
}

export async function updateTasteProfileServer(
  payload: TasteProfileUpdateInput,
) {
  return djangoJson<TasteProfile, TasteProfileUpdateInput>(
    tasteProfileDjangoApiUrlBuilder.me.update(),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function createTastePreferenceServer(
  payload: TastePreferenceCreateInput,
) {
  return djangoJson<TastePreferenceResponse>(
    preferenceBuilder(payload.kind).create(),
    {
      auth: 'required',
      method: 'POST',
      json: stripKind(payload),
    },
  );
}

export async function updateTastePreferenceServer(
  kind: TastePreferenceKind,
  itemId: ID,
  payload: TastePreferenceUpdateInput,
) {
  return djangoJson<TastePreferenceResponse>(
    preferenceBuilder(kind).update(itemId),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function deleteTastePreferenceServer(
  kind: TastePreferenceKind,
  itemId: ID,
) {
  return djangoJson<void>(
    preferenceBuilder(kind).delete(itemId),
    {
      auth: 'required',
      method: 'DELETE',
    },
  );
}
