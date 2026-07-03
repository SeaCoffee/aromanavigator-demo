// frontend/src/app/lib/session.ts

import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { REQUEST_PATH_HEADER } from '@/app/constants/requestHeaders';
import type { UserMe } from '@/app/types/userTypes';
import { djangoJson } from '@/app/services/djangoClient.server';
import { readServerRefreshToken } from '@/app/services/serverAuthTokens';
import { authNextApiUrlBuilder } from '@/app/urls/authNextApiUrlBuilder';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { userDjangoApiUrlBuilder } from '@/app/urls/userDjangoApiUrlBuilder';
import { safeNextPath } from '@/app/utils/safeNextPath';

function getApiStatus(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

function refreshUrl(next: string, login?: string) {
  return authNextApiUrlBuilder.refresh({
    next,
    ...(login ? { login } : {}),
  });
}

async function getRequestedPagePath(fallback: string) {
  try {
    const requestHeaders = await headers();
    return safeNextPath(requestHeaders.get(REQUEST_PATH_HEADER), fallback);
  } catch {
    return fallback;
  }
}

export const getUserServer = cache(async (): Promise<UserMe | null> => {
  try {
    return await djangoJson<UserMe>(userDjangoApiUrlBuilder.me(), {
      method: 'GET',
      auth: 'required',
    });
  } catch (error) {
    const status = getApiStatus(error);

    if (status === 401 || status === 403) {
      return null;
    }

    throw error;
  }
});

export async function requireUserOrRedirect(
  loginUrl?: string,
  refreshNext?: string,
): Promise<UserMe> {
  const user = await getUserServer();

  if (user) {
    return user;
  }

  const next = refreshNext ?? await getRequestedPagePath(mePageUrlBuilder.home());
  const login = loginUrl ?? authPageUrlBuilder.login({ next });
  const refresh = await readServerRefreshToken();

  if (refresh) {
    redirect(refreshUrl(next, login));
  }

  redirect(login);
}

export async function requireAdminOrRedirect(
  loginUrl?: string,
  notAllowedUrl = mePageUrlBuilder.home(),
): Promise<UserMe> {
  const user = await getUserServer();

  if (!user) {
    const next = await getRequestedPagePath(adminPageUrlBuilder.home());
    const login = loginUrl ?? authPageUrlBuilder.login({ next });
    const refresh = await readServerRefreshToken();

    if (refresh) {
      redirect(refreshUrl(next, login));
    }

    redirect(login);
  }

  if (!user.is_staff && !user.is_superuser) {
    redirect(notAllowedUrl);
  }

  return user;
}
