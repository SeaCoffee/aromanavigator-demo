'use server';

import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';

import { clearAuthCookies } from '@/app/lib/authCookies';
import {
  adminBlockUserServer,
  adminSuspendUserServer,
  adminUnblockUserServer,
  adminUnsuspendUserServer,
  deleteSelfServer,
  demoteToUserServer,
  promoteToAdminServer,
  promoteToModeratorServer,
  updateSelfServer,
} from '@/app/services/userServices.server';
import type { ApiMessage } from '@/app/types/authTypes';
import type { ActionMessage, ActionState } from '@/app/types/authTypes';
import type {
  ID,
  SuspendUserPayload,
  UpdateMePayload,
  UpdateMeResponse,
} from '@/app/types/userTypes';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { formatActionMessage } from '@/app/utils/messageUtils';

function errorMessageFromData(data: unknown, fallback: string): ActionMessage {
  if (!data) {
    return formatActionMessage(fallback);
  }

  if (typeof data === 'string') {
    return formatActionMessage(data, fallback);
  }

  if (Array.isArray(data)) {
    const strings = data.filter((item): item is string => typeof item === 'string');
    return strings.length > 0 ? formatActionMessage(strings, fallback) : formatActionMessage(fallback);
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (typeof record.detail === 'string') {
      return formatActionMessage(record.detail, fallback);
    }

    if (typeof record.message === 'string') {
      return formatActionMessage(record.message, fallback);
    }

    return record;
  }

  return formatActionMessage(fallback);
}

function errorToActionState<TData = unknown>(
  error: unknown,
  fallback: string,
): ActionState<TData> {
  const maybeApiError = error as {
    data?: unknown;
    message?: string;
  };

  return {
    ok: false,
    msg: errorMessageFromData(
      maybeApiError?.data,
      maybeApiError?.message || fallback,
    ),
  };
}

function revalidateAdminUser(id: ID) {
  revalidatePath(adminPageUrlBuilder.users.list());
  revalidatePath(adminPageUrlBuilder.users.detail(id));
}

export async function updateMeAction(
  payload: UpdateMePayload,
): Promise<ActionState<UpdateMeResponse>> {
  try {
    const data = await updateSelfServer(payload);

    revalidatePath(mePageUrlBuilder.home());
    revalidatePath(mePageUrlBuilder.profile.edit());

    return {
      ok: true,
      msg: 'РџСЂРѕС„С–Р»СЊ РѕРЅРѕРІР»РµРЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<UpdateMeResponse>(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё РїСЂРѕС„С–Р»СЊ.');
  }
}

export async function deleteMeAction(): Promise<ActionState<ApiMessage>> {
  try {
    await deleteSelfServer();

    await clearAuthCookies();
  } catch (error) {
    return errorToActionState<ApiMessage>(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚.');
  }

  redirect(sitePageUrlBuilder.home(), RedirectType.replace);
}

export async function adminSuspendUserAction(
  id: ID,
  payload: SuspendUserPayload,
): Promise<ActionState> {
  try {
    await adminSuspendUserServer(id, payload);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°Р±Р»РѕРєСѓРІР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.');
  }
}

export async function adminUnsuspendUserAction(id: ID): Promise<ActionState> {
  try {
    await adminUnsuspendUserServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'Р‘Р»РѕРєСѓРІР°РЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·РЅСЏС‚Рѕ.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РЅСЏС‚Рё Р±Р»РѕРєСѓРІР°РЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.');
  }
}

export async function adminBlockUserAction(id: ID): Promise<ActionState> {
  try {
    await adminBlockUserServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°Р±Р»РѕРєСѓРІР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.');
  }
}

export async function adminUnblockUserAction(id: ID): Promise<ActionState> {
  try {
    await adminUnblockUserServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° СЂРѕР·Р±Р»РѕРєРѕРІР°РЅРѕ.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ СЂРѕР·Р±Р»РѕРєСѓРІР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.');
  }
}

export async function promoteToAdminAction(id: ID): Promise<ActionState> {
  try {
    await promoteToAdminServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'Р РѕР»СЊ Р·РјС–РЅРµРЅРѕ РЅР° Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂР°.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё СЂРѕР»СЊ.');
  }
}

export async function promoteToModeratorAction(id: ID): Promise<ActionState> {
  try {
    await promoteToModeratorServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'Р РѕР»СЊ Р·РјС–РЅРµРЅРѕ РЅР° РјРѕРґРµСЂР°С‚РѕСЂР°.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё СЂРѕР»СЊ.');
  }
}

export async function demoteToUserAction(id: ID): Promise<ActionState> {
  try {
    await demoteToUserServer(id);

    revalidateAdminUser(id);

    return {
      ok: true,
      msg: 'Р РѕР»СЊ Р·РјС–РЅРµРЅРѕ РЅР° РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.',
    };
  } catch (error) {
    return errorToActionState(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё СЂРѕР»СЊ.');
  }
}
