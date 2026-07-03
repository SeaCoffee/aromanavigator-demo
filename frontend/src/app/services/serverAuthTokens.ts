// frontend/src/app/services/serverAuthTokens.ts

import 'server-only';

import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/app/constants/cookies_constants';

export async function readServerAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? '';
}

export async function readServerRefreshToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value ?? '';
}

export async function hasAnyServerAuthToken(): Promise<boolean> {
  const cookieStore = await cookies();

  return Boolean(
    cookieStore.get(ACCESS_COOKIE)?.value ||
    cookieStore.get(REFRESH_COOKIE)?.value,
  );
}
