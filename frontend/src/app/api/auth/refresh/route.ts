// frontend/src/app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { REFRESH_COOKIE } from '@/app/constants/cookies_constants';
import {
  clearAuthCookiesOnResponse,
  setAuthCookiesOnResponse,
} from '@/app/lib/authCookies';
import {
  djangoRefresh,
  pickAuthTokens,
} from '@/app/services/authServerServices';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { safeNextPath } from '@/app/utils/safeNextPath';

function redirectWithClearedCookies(request: NextRequest, to: string) {
  const response = NextResponse.redirect(new URL(to, request.url));
  clearAuthCookiesOnResponse(response);
  return response;
}

export async function GET(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value ?? '';

  const next = safeNextPath(
    request.nextUrl.searchParams.get('next') ?? undefined,
    mePageUrlBuilder.home(),
  );

  const login = safeNextPath(
    request.nextUrl.searchParams.get('login') ?? undefined,
    authPageUrlBuilder.login({ next }),
  );

  if (!refresh) {
    return redirectWithClearedCookies(request, login);
  }

  const response = await djangoRefresh(refresh);

  if (!response.r?.ok) {
    return redirectWithClearedCookies(request, login);
  }

  const tokens = pickAuthTokens(response.data);

  if (!tokens.access) {
    return redirectWithClearedCookies(request, login);
  }

  const redirectResponse = NextResponse.redirect(new URL(next, request.url));

  setAuthCookiesOnResponse(redirectResponse, {
    access: tokens.access,
    refresh: tokens.refresh ?? refresh,
  });

  return redirectResponse;
}
