'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  acceptExchangeServer,
  cancelExchangeServer,
  createExchangeProposalServer,
  rejectExchangeServer,
} from '@/app/services/exchangeServerServices';
import type {
  ExchangeAcceptPayload,
  ExchangeCreatePayload,
  ExchangeItemPayload,
  ExchangeItemType,
  ExchangeRejectPayload,
} from '@/app/types/exchangeTypes';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { getApiErrorMessage } from '@/errors/ApiError';

export type ExchangeActionResult =
  | { ok: true; msg?: string }
  | { ok: false; msg: string };

const EXCHANGE_ITEM_TYPES = ['wardrobe'] as const;
const MAX_EXCHANGE_OFFERED_ITEMS = 10;

function isExchangeItemType(value: unknown): value is ExchangeItemType {
  return (
    typeof value === 'string' &&
    EXCHANGE_ITEM_TYPES.includes(value as ExchangeItemType)
  );
}

function validateOfferedItemsCount(items: ExchangeItemPayload[]) {
  if (items.length > MAX_EXCHANGE_OFFERED_ITEMS) {
    throw new Error(
      `Р’ РѕРґРЅС–Р№ РїСЂРѕРїРѕР·РёС†С–С— РјРѕР¶РЅР° РѕР±СЂР°С‚Рё РјР°РєСЃРёРјСѓРј ${MAX_EXCHANGE_OFFERED_ITEMS} РїРѕР·РёС†С–Р№.`,
    );
  }
}

function normalizeActionError(error: unknown): string {
  return getApiErrorMessage(error, 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.');
}

function revalidateExchangePaths(id?: number | string) {
  revalidatePath(meExchangePageUrlBuilder.index());
  revalidatePath(meExchangePageUrlBuilder.sent());
  revalidatePath(meExchangePageUrlBuilder.received());

  if (id != null) {
    revalidatePath(meExchangePageUrlBuilder.detail(id));
  }
}

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function readNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`РќРµРєРѕСЂРµРєС‚РЅРµ Р·РЅР°С‡РµРЅРЅСЏ РїРѕР»СЏ ${key}.`);
  }

  return value;
}

function readExchangeItems(
  formData: FormData,
  key: string,
): ExchangeItemPayload[] {
  const raw = readString(formData, key);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    const items = parsed.map((item) => {
      const itemType = item?.type;
      const itemId = Number(item?.id);

      if (!isExchangeItemType(itemType)) {
        throw new Error();
      }

      if (!Number.isInteger(itemId) || itemId <= 0) {
        throw new Error();
      }

      return {
        type: itemType,
        id: itemId,
        note: typeof item.note === 'string' ? item.note.trim() : '',
      };
    });

    validateOfferedItemsCount(items);

    return items;
  } catch {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅРёР№ СЃРїРёСЃРѕРє РїРѕР·РёС†С–Р№ РґР»СЏ РѕР±РјС–РЅСѓ.');
  }
}

export async function createExchangeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ExchangeActionResult> {
  let createdId: number | null = null;

  try {
    const offerAll = readString(formData, 'offer_all') === 'true';

    const offeredItems = offerAll
      ? []
      : readExchangeItems(formData, 'offered_items');

    if (!offerAll && offeredItems.length === 0) {
      throw new Error(
        'РћР±РµСЂС–С‚СЊ РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ Р°Р±Рѕ РґРѕР·РІРѕР»СЊС‚Рµ РІР»Р°СЃРЅРёРєСѓ РІРёР±СЂР°С‚Рё Р· СѓСЃС–С”С— РІР°С€РѕС— РѕРіРѕР»РѕС€РµРЅРЅСЏ.',
      );
    }

    const requestedType = readString(formData, 'requested_type');

    if (!isExchangeItemType(requestedType)) {
      throw new Error('РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ.');
    }

    const payload: ExchangeCreatePayload = {
      requested_type: requestedType,
      requested_id: readNumber(formData, 'requested_id'),
      owner_id: readNumber(formData, 'owner_id'),
      offer_all: offerAll,
      offered_items: offeredItems,
      message: readString(formData, 'message'),
    };

    const created = await createExchangeProposalServer(payload);

    createdId = created.id;

    revalidateExchangePaths(created.id);
  } catch (error) {
    return { ok: false, msg: normalizeActionError(error) };
  }

  if (createdId == null) {
    return {
      ok: false,
      msg: 'РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ РѕР±РјС–РЅСѓ.',
    };
  }

  redirect(meExchangePageUrlBuilder.detail(createdId));
}

export async function acceptExchangeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ExchangeActionResult> {
  const id = readNumber(formData, 'id');

  try {
    const payload: ExchangeAcceptPayload = {
      accepted_items: readExchangeItems(formData, 'accepted_items'),
      decision_note: readString(formData, 'decision_note'),
    };

    await acceptExchangeServer(id, payload);
    revalidateExchangePaths(id);

    return { ok: true, msg: 'РџСЂРѕРїРѕР·РёС†С–СЋ РїСЂРёР№РЅСЏС‚Рѕ.' };
  } catch (error) {
    return { ok: false, msg: normalizeActionError(error) };
  }
}

export async function rejectExchangeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ExchangeActionResult> {
  const id = readNumber(formData, 'id');

  try {
    const payload: ExchangeRejectPayload = {
      decision_note: readString(formData, 'decision_note'),
    };

    await rejectExchangeServer(id, payload);
    revalidateExchangePaths(id);

    return { ok: true, msg: 'РџСЂРѕРїРѕР·РёС†С–СЋ РІС–РґС…РёР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: normalizeActionError(error) };
  }
}

export async function cancelExchangeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ExchangeActionResult> {
  const id = readNumber(formData, 'id');

  try {
    await cancelExchangeServer(id, {
      decision_note: readString(formData, 'decision_note'),
    });

    revalidateExchangePaths(id);

    return { ok: true, msg: 'РџСЂРѕРїРѕР·РёС†С–СЋ СЃРєР°СЃРѕРІР°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: normalizeActionError(error) };
  }
}
