import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/errors/ApiError';

vi.mock('react', async () => ({
  cache: <T extends (...args: any[]) => any>(fn: T) => fn,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/app/services/djangoClient.server', () => ({
  djangoJson: vi.fn(),
}));

vi.mock('@/app/services/serverAuthTokens', () => ({
  readServerRefreshToken: vi.fn(),
}));

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { djangoJson } from '@/app/services/djangoClient.server';
import { readServerRefreshToken } from '@/app/services/serverAuthTokens';
import {
  getUserServer,
  requireAdminOrRedirect,
  requireUserOrRedirect,
} from '@/app/lib/session';

const djangoJsonMock = vi.mocked(djangoJson);
const readServerRefreshTokenMock = vi.mocked(readServerRefreshToken);
const redirectMock = vi.mocked(redirect);
const headersMock = vi.mocked(headers);

function apiError(status: number) {
  return new ApiError({
    status,
    statusText: 'Error',
    url: '/userApi/users/me',
    data: { detail: 'Error' },
  });
}

describe('session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockRejectedValue(new Error('No request context'));
  });

  it('returns current user from Django', async () => {
    const user = { id: 1, email: 'test@example.com' } as any;

    djangoJsonMock.mockResolvedValue(user);

    await expect(getUserServer()).resolves.toEqual(user);
    expect(djangoJsonMock).toHaveBeenCalledWith('/userApi/users/me', {
      method: 'GET',
      auth: 'required',
    });
  });

  it('returns null for auth errors', async () => {
    djangoJsonMock.mockRejectedValue(apiError(401));

    await expect(getUserServer()).resolves.toBeNull();
  });

  it('redirects unauthenticated user through refresh route when refresh token exists', async () => {
    djangoJsonMock.mockRejectedValue(apiError(401));
    readServerRefreshTokenMock.mockResolvedValue('refresh-token');

    await expect(requireUserOrRedirect()).rejects.toThrow(
      'NEXT_REDIRECT:/api/auth/refresh?next=%2Fme&login=%2Flogin%3Fnext%3D%252Fme',
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/api/auth/refresh?next=%2Fme&login=%2Flogin%3Fnext%3D%252Fme',
    );
  });

  it('preserves the requested private page and query when redirecting to login', async () => {
    djangoJsonMock.mockRejectedValue(apiError(401));
    readServerRefreshTokenMock.mockResolvedValue('');
    headersMock.mockResolvedValue(
      new Headers({
        'x-aroma-request-path': '/me/exchange/42?source=notification',
      }),
    );

    await expect(requireUserOrRedirect()).rejects.toThrow(
      'NEXT_REDIRECT:/login?next=%2Fme%2Fexchange%2F42%3Fsource%3Dnotification',
    );
  });

  it('redirects unauthenticated admin to login without refresh token', async () => {
    djangoJsonMock.mockRejectedValue(apiError(401));
    readServerRefreshTokenMock.mockResolvedValue('');

    await expect(requireAdminOrRedirect()).rejects.toThrow(
      'NEXT_REDIRECT:/login?next=%2Fadmin',
    );

    expect(redirectMock).toHaveBeenCalledWith('/login?next=%2Fadmin');
  });

  it('redirects non-admin user to private home', async () => {
    djangoJsonMock.mockResolvedValue({
      id: 1,
      is_staff: false,
      is_superuser: false,
    });

    await expect(requireAdminOrRedirect()).rejects.toThrow('NEXT_REDIRECT:/me');
    expect(redirectMock).toHaveBeenCalledWith('/me');
  });
});
