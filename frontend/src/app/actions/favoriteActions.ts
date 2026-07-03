'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteFavoriteByTargetServer,
  deleteFavoriteServer,
  toggleFavoriteServer,
} from '@/app/services/favoriteServerServices';
import {
  FAVORITE_CONTENT_TYPES,
  type FavoriteActionOptions,
  type FavoriteActionResult,
  type FavoriteContentType,
  type FavoriteDeleteActionResult,
  type FavoriteTarget,
} from '@/app/types/favoriteTypes';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { getApiErrorMessage } from '@/errors/ApiError';

const DEFAULT_ERROR_MESSAGE = 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё РѕР±СЂР°РЅРµ.';
const AUTH_REQUIRED_MESSAGE = 'Р©РѕР± РґРѕРґР°С‚Рё РґРѕ РѕР±СЂР°РЅРѕРіРѕ, СѓРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚.';

function isAllowedFavoriteContentType(value: unknown): value is FavoriteContentType {
  return Object.values(FAVORITE_CONTENT_TYPES).includes(
    value as FavoriteContentType,
  );
}

function assertPositiveInteger(value: unknown, fieldName: string): number {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`РќРµРєРѕСЂРµРєС‚РЅРёР№ ${fieldName}.`);
  }

  return numberValue;
}

function validateTarget(target: FavoriteTarget): FavoriteTarget {
  if (!target || typeof target !== 'object') {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅР° С†С–Р»СЊ РѕР±СЂР°РЅРѕРіРѕ.');
  }

  if (!isAllowedFavoriteContentType(target.content_type)) {
    throw new Error('Р¦РµР№ С‚РёРї РѕР±СЂР°РЅРѕРіРѕ РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.');
  }

  return {
    content_type: target.content_type,
    object_id: assertPositiveInteger(target.object_id, 'ID РѕР±КјС”РєС‚Р°'),
  };
}

function normalizeRevalidatePaths(paths: string[] | undefined): string[] {
  const defaultPaths = [mePageUrlBuilder.favorites.list()];

  if (!Array.isArray(paths)) {
    return defaultPaths;
  }

  const safePaths = paths
    .filter((path): path is string => typeof path === 'string')
    .map((path) => path.trim())
    .filter((path) => path.startsWith('/'))
    .filter((path) => !path.startsWith('//'))
    .filter((path) => !path.includes('\\'))
    .filter((path) => !path.includes('://'))
    .filter((path) => path.length <= 300);

  return Array.from(new Set([...defaultPaths, ...safePaths])).slice(0, 8);
}

function revalidateFavoritePaths(options?: FavoriteActionOptions): void {
  for (const path of normalizeRevalidatePaths(options?.revalidatePaths)) {
    revalidatePath(path);
  }
}

function isAuthErrorMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  return (
    normalized.includes('no access token') ||
    normalized.includes('access token') ||
    normalized.includes('authentication credentials') ||
    normalized.includes('not authenticated') ||
    normalized.includes('unauthorized') ||
    normalized.includes('401') ||
    normalized.includes('403')
  );
}

function getFavoriteErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, DEFAULT_ERROR_MESSAGE);

  if (isAuthErrorMessage(message)) {
    return AUTH_REQUIRED_MESSAGE;
  }

  return message || DEFAULT_ERROR_MESSAGE;
}

export async function toggleFavoriteAction(
  target: FavoriteTarget,
  options?: FavoriteActionOptions,
): Promise<FavoriteActionResult> {
  try {
    const cleanTarget = validateTarget(target);

    const result = await toggleFavoriteServer({
      target: cleanTarget,
    });

    revalidateFavoritePaths(options);

    return {
      ok: true,
      favorited: result.favorited,
      favorite: result.favorite,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getFavoriteErrorMessage(error),
    };
  }
}

export async function deleteFavoriteByTargetAction(
  target: FavoriteTarget,
  options?: FavoriteActionOptions,
): Promise<FavoriteActionResult> {
  try {
    const cleanTarget = validateTarget(target);

    await deleteFavoriteByTargetServer({
      target: cleanTarget,
    });

    revalidateFavoritePaths(options);

    return {
      ok: true,
      favorited: false,
      favorite: null,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getFavoriteErrorMessage(error),
    };
  }
}

export async function deleteFavoriteAction(
  favoriteId: number,
  options?: FavoriteActionOptions,
): Promise<FavoriteDeleteActionResult> {
  try {
    const cleanFavoriteId = assertPositiveInteger(favoriteId, 'ID РѕР±СЂР°РЅРѕРіРѕ');

    await deleteFavoriteServer(cleanFavoriteId);

    revalidateFavoritePaths(options);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      msg: getFavoriteErrorMessage(error),
    };
  }
}
