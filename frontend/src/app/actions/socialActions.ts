'use server';

import { revalidatePath } from 'next/cache';

import {
  blockToggleServer,
  deleteSubscriptionServer,
  followToggleServer,
  subscribeToTargetServer,
  unsubscribeFromTargetServer,
} from '@/app/services/socialServices.server';
import { socialPageUrlBuilder } from '@/app/urls/pageUrls/socialPageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { normalizeSubscriptionTarget } from '@/app/utils/socialTargetUtils';
import { getApiErrorMessage } from '@/errors/ApiError';

import type { ID } from '@/app/types/http';
import type {
  SocialToggleResponse,
  SubscriptionOut,
  SubscriptionTarget,
} from '@/app/types/socialTypes';

type SocialActionResult<T> =
  | { ok: true; msg: string; data: T }
  | { ok: false; msg: string };

function revalidatePublicProfile(username?: string | null) {
  if (!username) return;

  revalidatePath(userPageUrlBuilder.publicProfile(username));
  revalidatePath(userPageUrlBuilder.followers(username));
  revalidatePath(userPageUrlBuilder.following(username));
}

function isSafeRevalidatePath(path?: string | null): path is string {
  return Boolean(
    path &&
      path.startsWith('/') &&
      !path.startsWith('//') &&
      !path.includes('\0') &&
      !path.includes('://'),
  );
}

function revalidateSubscriptionPages(currentPath?: string | null) {
  revalidatePath(socialPageUrlBuilder.subscriptions());

  if (isSafeRevalidatePath(currentPath)) {
    revalidatePath(currentPath);
  }
}

export async function followToggleAction(
  userId: ID,
  publicUsername?: string | null,
): Promise<SocialActionResult<SocialToggleResponse>> {
  try {
    const data = await followToggleServer(userId);

    revalidatePublicProfile(publicUsername);
    revalidatePath(socialPageUrlBuilder.followers());
    revalidatePath(socialPageUrlBuilder.following());

    return {
      ok: true,
      msg: data.status === 'followed'
        ? 'РџС–РґРїРёСЃРєСѓ РґРѕРґР°РЅРѕ.'
        : 'РџС–РґРїРёСЃРєСѓ СЃРєР°СЃРѕРІР°РЅРѕ.',
      data,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё РїС–РґРїРёСЃРєСѓ.'),
    };
  }
}

export async function blockToggleAction(
  userId: ID,
  publicUsername?: string | null,
): Promise<SocialActionResult<SocialToggleResponse>> {
  try {
    const data = await blockToggleServer(userId);

    revalidatePublicProfile(publicUsername);

    return {
      ok: true,
      msg: data.status === 'blocked'
        ? 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ.'
        : 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° СЂРѕР·Р±Р»РѕРєРѕРІР°РЅРѕ.',
      data,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё Р±Р»РѕРєСѓРІР°РЅРЅСЏ.'),
    };
  }
}

export async function subscriptionToggleAction(
  target: SubscriptionTarget,
  isSubscribed: boolean,
  currentPath?: string | null,
): Promise<SocialActionResult<SubscriptionOut | null>> {
  try {
    const normalizedTarget = normalizeSubscriptionTarget(target);

    if (isSubscribed) {
      await unsubscribeFromTargetServer(normalizedTarget);
      revalidateSubscriptionPages(currentPath);

      return {
        ok: true,
        msg: 'РџС–РґРїРёСЃРєСѓ СЃРєР°СЃРѕРІР°РЅРѕ.',
        data: null,
      };
    }

    const data = await subscribeToTargetServer(normalizedTarget);

    revalidateSubscriptionPages(currentPath);

    return {
      ok: true,
      msg: 'РџС–РґРїРёСЃРєСѓ РґРѕРґР°РЅРѕ.',
      data,
    };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё РїС–РґРїРёСЃРєСѓ.'),
    };
  }
}

export async function deleteSubscriptionAction(
  subscriptionId: ID,
): Promise<SocialActionResult<null>> {
  try {
    await deleteSubscriptionServer(subscriptionId);
    revalidateSubscriptionPages();

    return { ok: true, msg: 'РџС–РґРїРёСЃРєСѓ РІРёРґР°Р»РµРЅРѕ.', data: null };
  } catch (error) {
    return {
      ok: false,
      msg: getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё РїС–РґРїРёСЃРєСѓ.'),
    };
  }
}
