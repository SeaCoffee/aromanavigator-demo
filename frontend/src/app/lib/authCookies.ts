// frontend/src/app/lib/authCookies.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/app/constants/cookies_constants';

type AuthTokens = {
  access: string;
  refresh?: string;
};

const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: ACCESS_MAX_AGE,
};

const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: REFRESH_MAX_AGE,
};

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, tokens.access, accessCookieOptions);

  if (tokens.refresh) {
    cookieStore.set(REFRESH_COOKIE, tokens.refresh, refreshCookieOptions);
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export function setAuthCookiesOnResponse(
  response: NextResponse,
  tokens: AuthTokens,
) {
  response.cookies.set(ACCESS_COOKIE, tokens.access, accessCookieOptions);

  if (tokens.refresh) {
    response.cookies.set(REFRESH_COOKIE, tokens.refresh, refreshCookieOptions);
  }
}

export function clearAuthCookiesOnResponse(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}
