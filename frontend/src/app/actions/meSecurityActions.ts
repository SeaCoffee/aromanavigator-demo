'use server';

import { redirect, RedirectType } from 'next/navigation';

import { clearAuthCookies } from '@/app/lib/authCookies';
import {
  changePasswordServer,
  requestPasswordSetupServer,
} from '@/app/services/userServices.server';
import type {
  ActionMessage,
  ActionState,
  ApiMessage,
} from '@/app/types/authTypes';
import type { ChangePasswordPayload } from '@/app/types/userTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { formatActionMessage } from '@/app/utils/messageUtils';

function messageFromData(data: unknown, fallback: string): ActionMessage {
  if (!data) return formatActionMessage(fallback);
  if (typeof data === 'string') return formatActionMessage(data, fallback);

  if (Array.isArray(data)) {
    const strings = data.filter((item): item is string => typeof item === 'string');
    return strings.length > 0 ? formatActionMessage(strings, fallback) : formatActionMessage(fallback);
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (typeof record.detail === 'string') return formatActionMessage(record.detail, fallback);
    if (typeof record.message === 'string') return formatActionMessage(record.message, fallback);

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
    msg: messageFromData(maybeApiError?.data, maybeApiError?.message || fallback),
  };
}

export async function changePasswordAction(
  payload: ChangePasswordPayload,
): Promise<ActionState<ApiMessage>> {
  try {
    await changePasswordServer(payload);
    await clearAuthCookies();
  } catch (error) {
    return errorToActionState<ApiMessage>(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ.');
  }

  redirect(
    authPageUrlBuilder.login({
      next: mePageUrlBuilder.home(),
    }),
    RedirectType.replace,
  );
}

export async function requestPasswordSetupAction(): Promise<ActionState<ApiMessage>> {
  try {
    const data = await requestPasswordSetupServer();

    return {
      ok: true,
      msg:
        data.detail ??
        data.message ??
        'РџРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РЅР°РґС–СЃР»Р°РЅРѕ РЅР° email Р°РєР°СѓРЅС‚Р°.',
      data,
    };
  } catch (error) {
    return errorToActionState<ApiMessage>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РЅР°РґС–СЃР»Р°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ.',
    );
  }
}
