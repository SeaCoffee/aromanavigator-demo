'use server';

import { revalidatePath } from 'next/cache';

import {
  createTastePreferenceServer,
  deleteTastePreferenceServer,
  updateTastePreferenceServer,
  updateTasteProfileServer,
} from '@/app/services/tasteProfileServices.server';
import type { ActionResult } from '@/app/types/fragranceTypes';
import type {
  TasteAttitude,
  TasteConcentration,
  TasteFragranceMark,
  TastePreferenceKind,
  TastePriority,
  TasteSeason,
} from '@/app/types/tasteProfileTypes';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { tasteProfilePageUrlBuilder } from '@/app/urls/pageUrls/tasteProfilePageUrlBuilder';

const TASTE_PREFERENCE_KINDS: TastePreferenceKind[] = [
  'families',
  'notes',
  'perfumers',
  'brands',
  'seasons',
  'concentrations',
  'fragrances',
];

const ATTITUDES: TasteAttitude[] = ['like', 'dislike'];
const SEASONS: TasteSeason[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'all_season',
];
const CONCENTRATIONS: TasteConcentration[] = [
  'edc',
  'edt',
  'edp',
  'parfum',
  'extrait',
  'oil',
  'mist',
];
const MARKS: TasteFragranceMark[] = ['looking_for', 'do_not_offer'];
const PRIORITIES: TastePriority[] = ['low', 'normal', 'high'];

function ok<T = void>(msg: string, data?: T): ActionResult<T> {
  return data === undefined ? { ok: true, msg } : { ok: true, msg, data };
}

function fail<T = void>(msg: unknown): ActionResult<T> {
  if (msg instanceof Error) {
    return { ok: false, msg: msg.message };
  }

  if (typeof msg === 'string') {
    return { ok: false, msg };
  }

  if (msg && typeof msg === 'object') {
    return { ok: false, msg: msg as Record<string, unknown> };
  }

  return { ok: false, msg: 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.' };
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function readRequiredNumber(formData: FormData, key: string) {
  const value = Number(readString(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('РћР±РµСЂС–С‚СЊ Р·РЅР°С‡РµРЅРЅСЏ Р·С– СЃРїРёСЃРєСѓ.');
  }

  return value;
}

function readKind(formData: FormData): TastePreferenceKind {
  const value = readString(formData, 'kind') as TastePreferenceKind;

  if (!TASTE_PREFERENCE_KINDS.includes(value)) {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї РµР»РµРјРµРЅС‚Р° РїСЂРѕС„С–Р»СЋ.');
  }

  return value;
}

function readChoice<T extends string>(
  formData: FormData,
  key: string,
  allowed: readonly T[],
  fallback?: T,
) {
  const value = readString(formData, key) as T;

  if (allowed.includes(value)) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error('РќРµРєРѕСЂРµРєС‚РЅРµ Р·РЅР°С‡РµРЅРЅСЏ.');
}

function refreshTasteProfile() {
  revalidatePath(mePageUrlBuilder.perfumeProfile.detail());
  revalidatePath(tasteProfilePageUrlBuilder.me.detail());
}

export async function updateTasteProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await updateTasteProfileServer({
      is_public: formData.get('is_public') === '1',
      about: readString(formData, 'about'),
    });

    refreshTasteProfile();

    return ok('РџСЂРѕС„С–Р»СЊ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(error);
  }
}

export async function createTastePreferenceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const kind = readKind(formData);
    const comment = readString(formData, 'comment');

    if (kind === 'families') {
      await createTastePreferenceServer({
        kind,
        family_id: readRequiredNumber(formData, 'entity_id'),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'notes') {
      await createTastePreferenceServer({
        kind,
        note_id: readRequiredNumber(formData, 'entity_id'),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'perfumers') {
      await createTastePreferenceServer({
        kind,
        perfumer_id: readRequiredNumber(formData, 'entity_id'),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'brands') {
      await createTastePreferenceServer({
        kind,
        brand_id: readRequiredNumber(formData, 'entity_id'),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'seasons') {
      await createTastePreferenceServer({
        kind,
        season: readChoice(formData, 'entity_id', SEASONS),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'concentrations') {
      await createTastePreferenceServer({
        kind,
        concentration: readChoice(formData, 'entity_id', CONCENTRATIONS),
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    if (kind === 'fragrances') {
      await createTastePreferenceServer({
        kind,
        fragrance_id: readRequiredNumber(formData, 'entity_id'),
        mark: readChoice(formData, 'mark', MARKS),
        priority: readChoice(formData, 'priority', PRIORITIES, 'normal'),
        comment,
      });
    }

    refreshTasteProfile();

    return ok('Р•Р»РµРјРµРЅС‚ РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail(error);
  }
}

export async function updateTastePreferenceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const kind = readKind(formData);
    const itemId = readRequiredNumber(formData, 'item_id');
    const comment = readString(formData, 'comment');

    if (kind === 'fragrances') {
      await updateTastePreferenceServer(kind, itemId, {
        mark: readChoice(formData, 'mark', MARKS),
        priority: readChoice(formData, 'priority', PRIORITIES, 'normal'),
        comment,
      });
    } else {
      await updateTastePreferenceServer(kind, itemId, {
        attitude: readChoice(formData, 'attitude', ATTITUDES),
        comment,
      });
    }

    refreshTasteProfile();

    return ok('Р•Р»РµРјРµРЅС‚ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTastePreferenceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await deleteTastePreferenceServer(
      readKind(formData),
      readRequiredNumber(formData, 'item_id'),
    );

    refreshTasteProfile();

    return ok('Р•Р»РµРјРµРЅС‚ РІРёРґР°Р»РµРЅРѕ.');
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTastePreferenceFormAction(formData: FormData) {
  await deleteTastePreferenceAction(null, formData);
}
