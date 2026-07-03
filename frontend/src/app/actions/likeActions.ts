'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteLikeByTargetServer,
  deleteLikeServer,
  toggleLikeServer,
} from '@/app/services/likeServerServices';
import {
  LIKE_CONTENT_TYPES,
  type LikeActionOptions,
  type LikeActionResult,
  type LikeContentType,
  type LikeTarget,
} from '@/app/types/likeTypes';
import { getApiErrorMessage } from '@/errors/ApiError';

const DEFAULT_ERROR_MESSAGE = 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё РІРїРѕРґРѕР±Р°РЅРЅСЏ.';

function isAllowedLikeContentType(value: unknown): value is LikeContentType {
  return Object.values(LIKE_CONTENT_TYPES).includes(value as LikeContentType);
}

function assertPositiveInteger(value: unknown, fieldName: string): number {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`РќРµРєРѕСЂРµРєС‚РЅРёР№ ${fieldName}.`);
  }

  return numberValue;
}

function validateTarget(target: LikeTarget): LikeTarget {
  if (!target || typeof target !== 'object') {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅР° С†С–Р»СЊ РІРїРѕРґРѕР±Р°РЅРЅСЏ.');
  }

  if (!isAllowedLikeContentType(target.content_type)) {
    throw new Error('Р¦РµР№ С‚РёРї РІРїРѕРґРѕР±Р°РЅРЅСЏ РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.');
  }

  return {
    content_type: target.content_type,
    object_id: assertPositiveInteger(target.object_id, 'ID РѕР±КјС”РєС‚Р°'),
  };
}

function normalizeRevalidatePaths(paths: string[] | undefined): string[] {
  if (!Array.isArray(paths)) {
    return [];
  }

  return Array.from(
    new Set(
      paths
        .filter((path): path is string => typeof path === 'string')
        .map((path) => path.trim())
        .filter((path) => path.startsWith('/'))
        .filter((path) => !path.startsWith('//'))
        .filter((path) => !path.includes('\\'))
        .filter((path) => !path.includes('://'))
        .filter((path) => path.length <= 300),
    ),
  ).slice(0, 8);
}

function revalidateLikePaths(options?: LikeActionOptions): void {
  for (const path of normalizeRevalidatePaths(options?.revalidatePaths)) {
    revalidatePath(path);
  }
}

export async function toggleLikeAction(
  target: LikeTarget,
  options?: LikeActionOptions,
): Promise<LikeActionResult> {
  try {
    const cleanTarget = validateTarget(target);

    const result = await toggleLikeServer({
      target: cleanTarget,
    });

    revalidateLikePaths(options);

    return {
      ok: true,
      liked: result.liked,
      like: result.like,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
    };
  }
}

export async function deleteLikeByTargetAction(
  target: LikeTarget,
  options?: LikeActionOptions,
): Promise<LikeActionResult> {
  try {
    const cleanTarget = validateTarget(target);

    await deleteLikeByTargetServer({
      target: cleanTarget,
    });

    revalidateLikePaths(options);

    return {
      ok: true,
      liked: false,
      like: null,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
    };
  }
}

export async function deleteLikeAction(
  likeId: number,
  options?: LikeActionOptions,
): Promise<LikeActionResult> {
  try {
    const cleanId = assertPositiveInteger(likeId, 'ID РІРїРѕРґРѕР±Р°РЅРЅСЏ');

    await deleteLikeServer(cleanId);

    revalidateLikePaths(options);

    return {
      ok: true,
      liked: false,
      like: null,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
    };
  }
}
