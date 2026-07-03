'use server';

import { revalidatePath } from 'next/cache';

import { errorToActionState } from '@/app/actions/actionHelpers/wardrobeActionStateHelpers';
import {
  createWardrobeItemServer,
  deleteWardrobeItemServer,
  updateWardrobeItemServer,
} from '@/app/services/wardrobeServices.server';
import type { ActionState } from '@/app/types/authTypes';
import type { ID } from '@/app/types/http';
import type {
  WardrobeCreatePayload,
  WardrobeItem,
  WardrobeStatus,
  WardrobeUpdatePayload,
} from '@/app/types/wardrobeTypes';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';

const WARDROBE_STATUSES: readonly WardrobeStatus[] = [
  'own',
  'want',
  'had',
  'sample',
  'favorite',
];

type WardrobeActionOptions = {
  refreshPaths?: string[];
};

type ToggleWardrobeStatusInput = {
  fragrance_id: ID;
  status: WardrobeStatus;
  active_item_id?: ID | null;
  refreshPaths?: string[];
};

function normalizeId(value: ID, message: string): number {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(message);
  }

  return numericValue;
}

function normalizeStatus(value: unknown): WardrobeStatus {
  if (WARDROBE_STATUSES.includes(value as WardrobeStatus)) {
    return value as WardrobeStatus;
  }

  return 'own';
}

function normalizeRating(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 10) {
    throw new Error('РћС†С–РЅРєР° РјР°С” Р±СѓС‚Рё РІС–Рґ 1 РґРѕ 10.');
  }

  return numericValue;
}

function normalizeNullableText(value: unknown): string | null {
  const text = String(value ?? '').trim();

  return text.length > 0 ? text : null;
}

function normalizeRefreshPaths(paths: string[] | undefined): string[] {
  if (!Array.isArray(paths)) {
    return [];
  }

  return paths
    .filter((path) => path.startsWith('/') && !path.startsWith('//'))
    .slice(0, 10);
}

function normalizeCreatePayload(
  payload: WardrobeCreatePayload,
): WardrobeCreatePayload {
  return {
    fragrance_id: normalizeId(
      payload.fragrance_id,
      'РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РґРѕРІС–РґРЅРёРєР°.',
    ),
    status: normalizeStatus(payload.status),
    rating: normalizeRating(payload.rating),
    notes: normalizeNullableText(payload.notes),
    is_private: Boolean(payload.is_private),
  };
}

function normalizeUpdatePayload(
  payload: WardrobeUpdatePayload,
): WardrobeUpdatePayload {
  const normalized: WardrobeUpdatePayload = {};

  if (payload.fragrance_id !== undefined) {
    normalized.fragrance_id = normalizeId(
      payload.fragrance_id,
      'РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РґРѕРІС–РґРЅРёРєР°.',
    );
  }

  if (payload.status !== undefined) {
    normalized.status = normalizeStatus(payload.status);
  }

  if (payload.rating !== undefined) {
    normalized.rating = normalizeRating(payload.rating);
  }

  if (payload.notes !== undefined) {
    normalized.notes = normalizeNullableText(payload.notes);
  }

  if (payload.is_private !== undefined) {
    normalized.is_private = Boolean(payload.is_private);
  }

  return normalized;
}

function assertHasUpdatePayload(payload: WardrobeUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new Error('РќРµРјР°С” РґР°РЅРёС… РґР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ.');
  }
}

function refreshWardrobePages(itemId?: ID, options?: WardrobeActionOptions) {
  revalidatePath(wardrobePageUrlBuilder.me.list());

  if (itemId) {
    revalidatePath(wardrobePageUrlBuilder.me.edit(itemId));
  }

  for (const path of normalizeRefreshPaths(options?.refreshPaths)) {
    revalidatePath(path);
  }
}

export async function createWardrobeItemAction(
  payload: WardrobeCreatePayload,
  options?: WardrobeActionOptions,
): Promise<ActionState<WardrobeItem>> {
  try {
    const data = await createWardrobeItemServer(normalizeCreatePayload(payload));

    refreshWardrobePages(data.id, options);

    return {
      ok: true,
      msg: 'РђСЂРѕРјР°С‚ РґРѕРґР°РЅРѕ РґРѕ РіР°СЂРґРµСЂРѕР±Р°.',
      data,
    };
  } catch (error) {
    return errorToActionState<WardrobeItem>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РґРѕРґР°С‚Рё Р°СЂРѕРјР°С‚.',
    );
  }
}

export async function updateWardrobeItemAction(
  itemId: ID,
  payload: WardrobeUpdatePayload,
  options?: WardrobeActionOptions,
): Promise<ActionState<WardrobeItem>> {
  try {
    const normalizedItemId = normalizeId(
      itemId,
      'РќРµРєРѕСЂРµРєС‚РЅРёР№ РµР»РµРјРµРЅС‚ РіР°СЂРґРµСЂРѕР±Р°.',
    );
    const normalizedPayload = normalizeUpdatePayload(payload);

    assertHasUpdatePayload(normalizedPayload);

    const data = await updateWardrobeItemServer(
      normalizedItemId,
      normalizedPayload,
    );

    refreshWardrobePages(normalizedItemId, options);

    return {
      ok: true,
      msg: 'Р“Р°СЂРґРµСЂРѕР± РѕРЅРѕРІР»РµРЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<WardrobeItem>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё Р°СЂРѕРјР°С‚.',
    );
  }
}

export async function deleteWardrobeItemAction(
  itemId: ID,
  options?: WardrobeActionOptions,
): Promise<ActionState<null>> {
  try {
    const normalizedItemId = normalizeId(
      itemId,
      'РќРµРєРѕСЂРµРєС‚РЅРёР№ РµР»РµРјРµРЅС‚ РіР°СЂРґРµСЂРѕР±Р°.',
    );

    await deleteWardrobeItemServer(normalizedItemId);
    refreshWardrobePages(normalizedItemId, options);

    return {
      ok: true,
      msg: 'РђСЂРѕРјР°С‚ РІРёРґР°Р»РµРЅРѕ Р· РіР°СЂРґРµСЂРѕР±Р°.',
      data: null,
    };
  } catch (error) {
    return errorToActionState<null>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё Р°СЂРѕРјР°С‚.',
    );
  }
}

export async function toggleWardrobeStatusAction(
  input: ToggleWardrobeStatusInput,
): Promise<ActionState<WardrobeItem | null>> {
  if (input.active_item_id) {
    return deleteWardrobeItemAction(input.active_item_id, {
      refreshPaths: input.refreshPaths,
    });
  }

  return createWardrobeItemAction(
    {
      fragrance_id: input.fragrance_id,
      status: input.status,
      is_private: false,
      rating: null,
      notes: null,
    },
    {
      refreshPaths: input.refreshPaths,
    },
  );
}
