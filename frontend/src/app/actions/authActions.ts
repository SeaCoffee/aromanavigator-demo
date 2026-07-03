'use server';

import { redirect, RedirectType } from 'next/navigation';

import { clearAuthCookies, setAuthCookies } from '@/app/lib/authCookies';
import {
  activateAccountServer,
  djangoGoogleLogin,
  djangoLogin,
  djangoLogout,
  djangoRefresh,
  getServerAccessToken,
  getServerRefreshToken,
  pickAuthTokens,
  recoveryRequestServer,
  recoveryResetServer,
  registerServer,
} from '@/app/services/authServerServices';
import type {
  ActionMessage,
  ActionState,
  AuthSuccessResponse,
  LoginPayload,
  RecoveryRequestPayload,
  RecoveryResetPayload,
  RegisterPayload,
} from '@/app/types/authTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { safeNextPath } from '@/app/utils/safeNextPath';
import { formatActionMessage } from '@/app/utils/messageUtils';

type ProxyActionResponse = {
  r?: Response | null;
  data?: unknown;
  text?: string | null;
  error?: {
    message?: string;
  } | null;
};

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

function proxyErrorToActionState<TData = unknown>(
  response: ProxyActionResponse,
  fallback: string,
): ActionState<TData> {
  if (!response.r) {
    return {
      ok: false,
      msg: response.error?.message ?? fallback,
    };
  }

  return {
    ok: false,
    msg: messageFromData(response.data ?? response.text, fallback),
  };
}

async function persistAuthTokens(tokens: { access?: string; refresh?: string }) {
  if (!tokens.access) {
    return false;
  }

  await setAuthCookies({
    access: tokens.access,
    refresh: tokens.refresh,
  });

  return true;
}

export async function loginAction(
  payload: LoginPayload,
  next?: string,
): Promise<ActionState<AuthSuccessResponse>> {
  const response = await djangoLogin(payload);

  if (!response.r?.ok) {
    return proxyErrorToActionState<AuthSuccessResponse>(
      response,
      'РќРµ РІРґР°Р»РѕСЃСЏ СѓРІС–Р№С‚Рё. РџРµСЂРµРІС–СЂС‚Рµ email С– РїР°СЂРѕР»СЊ.',
    );
  }

  const saved = await persistAuthTokens(pickAuthTokens(response.data));

  if (!saved) {
    return {
      ok: false,
      msg: 'Р’С–РґРїРѕРІС–РґСЊ РІС…РѕРґСѓ РЅРµ РјС–СЃС‚РёС‚СЊ access-С‚РѕРєРµРЅ.',
    };
  }

  redirect(safeNextPath(next, mePageUrlBuilder.home()), RedirectType.replace);
}

export async function registerAction(
  payload: RegisterPayload,
): Promise<ActionState<AuthSuccessResponse>> {
  try {
    const user = await registerServer(payload);

    return {
      ok: true,
      msg: 'РђРєР°СѓРЅС‚ СЃС‚РІРѕСЂРµРЅРѕ. РџРµСЂРµРІС–СЂС‚Рµ РїРѕС€С‚Сѓ, С‰РѕР± Р°РєС‚РёРІСѓРІР°С‚Рё Р№РѕРіРѕ.',
      data: {
        user,
      },
    };
  } catch (error) {
    return errorToActionState<AuthSuccessResponse>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё Р°РєР°СѓРЅС‚.',
    );
  }
}

export async function googleLoginAction(
  idToken: string,
  next?: string,
): Promise<ActionState<AuthSuccessResponse>> {
  const response = await djangoGoogleLogin({ id_token: idToken });

  if (!response.r?.ok) {
    return proxyErrorToActionState<AuthSuccessResponse>(
      response,
      'РќРµ РІРґР°Р»РѕСЃСЏ СѓРІС–Р№С‚Рё С‡РµСЂРµР· Google.',
    );
  }

  const saved = await persistAuthTokens(pickAuthTokens(response.data));

  if (!saved) {
    return {
      ok: false,
      msg: 'Р’С–РґРїРѕРІС–РґСЊ Google РЅРµ РјС–СЃС‚РёС‚СЊ access-С‚РѕРєРµРЅ.',
    };
  }

  redirect(safeNextPath(next, mePageUrlBuilder.home()), RedirectType.replace);
}

export async function logoutAction(
  redirectTo = sitePageUrlBuilder.home(),
): Promise<ActionState<AuthSuccessResponse>> {
  const access = await getServerAccessToken();
  const refresh = await getServerRefreshToken();

  if (refresh) {
    try {
      await djangoLogout({
        access: access ?? undefined,
        refresh,
      });
    } catch {
      // Cookies are cleared locally even if Django logout is already expired.
    }
  }

  await clearAuthCookies();

  redirect(safeNextPath(redirectTo, authPageUrlBuilder.login()), RedirectType.replace);
}

export async function refreshSessionAction(): Promise<ActionState<AuthSuccessResponse>> {
  const refresh = await getServerRefreshToken();

  if (!refresh) {
    await clearAuthCookies();

    return {
      ok: false,
      msg: 'РЎРµСЃС–СЏ РІС–РґСЃСѓС‚РЅСЏ. РЈРІС–Р№РґС–С‚СЊ С‰Рµ СЂР°Р·.',
    };
  }

  const response = await djangoRefresh(refresh);

  if (!response.r?.ok) {
    await clearAuthCookies();

    return proxyErrorToActionState<AuthSuccessResponse>(
      response,
      'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё СЃРµСЃС–СЋ.',
    );
  }

  const saved = await persistAuthTokens(pickAuthTokens(response.data));

  if (!saved) {
    await clearAuthCookies();

    return {
      ok: false,
      msg: 'Р’С–РґРїРѕРІС–РґСЊ РѕРЅРѕРІР»РµРЅРЅСЏ СЃРµСЃС–С— РЅРµ РјС–СЃС‚РёС‚СЊ access-С‚РѕРєРµРЅ.',
    };
  }

  return {
    ok: true,
    msg: 'РЎРµСЃС–СЋ РѕРЅРѕРІР»РµРЅРѕ.',
  };
}

export async function activateAccountAction(
  token: string,
): Promise<ActionState<AuthSuccessResponse>> {
  try {
    const user = await activateAccountServer(token);

    return {
      ok: true,
      msg: 'РђРєР°СѓРЅС‚ Р°РєС‚РёРІРѕРІР°РЅРѕ. РўРµРїРµСЂ РјРѕР¶РЅР° СѓРІС–Р№С‚Рё.',
      data: {
        user,
      },
    };
  } catch (error) {
    return errorToActionState<AuthSuccessResponse>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ Р°РєС‚РёРІСѓРІР°С‚Рё Р°РєР°СѓРЅС‚.',
    );
  }
}

export async function recoveryRequestAction(
  payload: RecoveryRequestPayload,
): Promise<ActionState<AuthSuccessResponse>> {
  try {
    await recoveryRequestServer(payload);

    return {
      ok: true,
      msg: 'РЇРєС‰Рѕ email С–СЃРЅСѓС”, РјРё РЅР°РґС–СЃР»Р°Р»Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ.',
    };
  } catch (error) {
    return errorToActionState<AuthSuccessResponse>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РЅР°РґС–СЃР»Р°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ.',
    );
  }
}

export async function recoveryResetAction(
  token: string,
  payload: RecoveryResetPayload,
): Promise<ActionState<AuthSuccessResponse>> {
  try {
    await recoveryResetServer(token, payload);

    return {
      ok: true,
      msg: 'РџР°СЂРѕР»СЊ Р·РјС–РЅРµРЅРѕ. РЈРІС–Р№РґС–С‚СЊ Р· РЅРѕРІРёРј РїР°СЂРѕР»РµРј.',
    };
  } catch (error) {
    return errorToActionState<AuthSuccessResponse>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ Р·РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ.',
    );
  }
}
