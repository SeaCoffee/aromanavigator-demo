import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/services/serverAuthTokens', () => ({
  readServerAccessToken: vi.fn(),
}));

vi.mock('@/app/utils/proxyDjango', () => ({
  proxyDjango: vi.fn(),
}));

import { djangoJson } from '@/app/services/djangoClient.server';
import { readServerAccessToken } from '@/app/services/serverAuthTokens';
import { proxyDjango } from '@/app/utils/proxyDjango';

const readTokenMock = vi.mocked(readServerAccessToken);
const proxyMock = vi.mocked(proxyDjango);

function response(status: number) {
  return new Response(null, { status });
}

describe('djangoJson optional authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readTokenMock.mockResolvedValue('stale-access-token');
  });

  it('retries an optional-auth request anonymously after a 401', async () => {
    proxyMock
      .mockResolvedValueOnce({
        r: response(401),
        data: { detail: 'user_not_found' },
        text: null,
      })
      .mockResolvedValueOnce({
        r: response(200),
        data: { results: [] },
        text: null,
      });

    await expect(
      djangoJson('/userApi/fragrance/fragrances', { auth: 'auto' }),
    ).resolves.toEqual({ results: [] });

    expect(proxyMock).toHaveBeenCalledTimes(2);
    expect(
      new Headers(proxyMock.mock.calls[0][1]?.headers).get('authorization'),
    ).toBe('Bearer stale-access-token');
    expect(
      new Headers(proxyMock.mock.calls[1][1]?.headers).has('authorization'),
    ).toBe(false);
  });

  it('does not downgrade required authentication to an anonymous request', async () => {
    proxyMock.mockResolvedValue({
      r: response(401),
      data: { detail: 'user_not_found' },
      text: null,
    });

    await expect(
      djangoJson('/userApi/users/me', { auth: 'required' }),
    ).rejects.toMatchObject({ status: 401 });

    expect(proxyMock).toHaveBeenCalledTimes(1);
  });
});
