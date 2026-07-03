// frontend/src/app/services/authServerServices.ts

import 'server-only';

import { cache } from 'react';

import {
  readServerAccessToken,
  readServerRefreshToken,
} from '@/app/services/serverAuthTokens';
import { djangoJson } from '@/app/services/djangoClient.server';
import { authDjangoApiUrlBuilder } from '@/app/urls/authDjangoApiUrlBuilder';
import { userDjangoApiUrlBuilder } from '@/app/urls/userDjangoApiUrlBuilder';
import { proxyDjango, type ProxyResult } from '@/app/utils/proxyDjango';
import type {
  ActivateAccountResponse,
  ApiMessage,
  GoogleLoginPayload,
  LoginPayload,
  RecoveryRequestPayload,
  RecoveryResetPayload,
  RecoveryResetResponse,
  RecoveryTokenCheckResponse,
  RefreshResponse,
  RegisterPayload,
  Tokens,
} from '@/app/types/authTypes';
import type { UserMe } from '@/app/types/userTypes';

export type AuthTokenResponse = Partial<Tokens> | null;

const JWT_EXP_SKEW_SECONDS = 30;


function getJwtExpSeconds(token: string): number | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as { exp?: unknown };

    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

function isAccessProbablyUsable(token: string): boolean {
  if (!token || token.length < 10) {
    return false;
  }

  const exp = getJwtExpSeconds(token);

  if (!exp) {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  return exp > nowSeconds + JWT_EXP_SKEW_SECONDS;
}

export function pickAuthTokens(data: unknown): {
  access?: string;
  refresh?: string;
} {
  const value = data as {
    access?: unknown;
    refresh?: unknown;
    tokens?: {
      access?: unknown;
      refresh?: unknown;
    };
  } | null;

  const access =
    (typeof value?.access === 'string' && value.access) ||
    (typeof value?.tokens?.access === 'string' && value.tokens.access) ||
    undefined;

  const refresh =
    (typeof value?.refresh === 'string' && value.refresh) ||
    (typeof value?.tokens?.refresh === 'string' && value.tokens.refresh) ||
    undefined;

  return {
    access,
    refresh,
  };
}

export const getServerAccessToken = cache(async (): Promise<string | null> => {
  const access = await readServerAccessToken();

  if (isAccessProbablyUsable(access)) {
    return access;
  }

  return null;
});

export const getServerRefreshToken = cache(async (): Promise<string | null> => {
  const refresh = await readServerRefreshToken();

  return refresh || null;
});

export async function djangoMe(access: string): Promise<ProxyResult> {
  const headers = new Headers();

  headers.set('authorization', `Bearer ${access}`);

  return proxyDjango(userDjangoApiUrlBuilder.me(), {
    method: 'GET',
    headers,
  });
}

export async function djangoLogin(payload: LoginPayload): Promise<ProxyResult> {
  return proxyDjango(authDjangoApiUrlBuilder.login(), {
    method: 'POST',
    json: payload,
  });
}

export async function djangoGoogleLogin(
  payload: GoogleLoginPayload,
): Promise<ProxyResult> {
  return proxyDjango(authDjangoApiUrlBuilder.social.google(), {
    method: 'POST',
    json: payload,
  });
}

export async function djangoRefresh(
  refresh: string,
): Promise<ProxyResult & { data: RefreshResponse | null }> {
  const { r, data, text, error } = await proxyDjango(
    authDjangoApiUrlBuilder.refresh(),
    {
      method: 'POST',
      json: { refresh },
    },
  );

  return {
    r,
    data: data as RefreshResponse | null,
    text,
    error,
  };
}

export async function djangoLogout(params: {
  access?: string;
  refresh?: string;
}): Promise<ProxyResult> {
  const headers = new Headers();

  if (params.access) {
    headers.set('authorization', `Bearer ${params.access}`);
  }

  return proxyDjango(authDjangoApiUrlBuilder.logout(), {
    method: 'POST',
    headers,
    json: {
      refresh: params.refresh ?? '',
    },
  });
}

export function registerServer(payload: RegisterPayload) {
  return djangoJson<UserMe, RegisterPayload>(
    authDjangoApiUrlBuilder.register(),
    {
      method: 'POST',
      auth: 'none',
      json: payload,
    },
  );
}

export function activateAccountServer(token: string) {
  return djangoJson<ActivateAccountResponse>(
    authDjangoApiUrlBuilder.activate(token),
    {
      method: 'GET',
      auth: 'none',
    },
  );
}

export function recoveryRequestServer(payload: RecoveryRequestPayload) {
  return djangoJson<ApiMessage, RecoveryRequestPayload>(
    authDjangoApiUrlBuilder.recovery.request(),
    {
      method: 'POST',
      auth: 'none',
      json: payload,
    },
  );
}

export function recoveryTokenCheckServer(token: string) {
  return djangoJson<RecoveryTokenCheckResponse>(
    authDjangoApiUrlBuilder.recovery.withToken(token),
    {
      method: 'GET',
      auth: 'none',
    },
  );
}

export function recoveryResetServer(
  token: string,
  payload: RecoveryResetPayload,
) {
  return djangoJson<RecoveryResetResponse, RecoveryResetPayload>(
    authDjangoApiUrlBuilder.recovery.withToken(token),
    {
      method: 'POST',
      auth: 'none',
      json: payload,
    },
  );
}
