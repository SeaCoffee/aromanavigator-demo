import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/services/userApi', () => ({
  anonApi: {
    get: vi.fn(),
  },
}));

import { activateAccount } from '@/app/services/authServices';
import { anonApi } from '@/app/services/userApi';
import { authAnonApiUrlBuilder } from '@/app/urls/authAnonApiUrlBuilder';

const anonGetMock = anonApi.get as ReturnType<typeof vi.fn>;

describe('auth_service.activateAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds activation URL through anonymous proxy builder', () => {
    expect(authAnonApiUrlBuilder.activate('abc')).toBe(
      '/api/anonApi/auth/activate/abc',
    );
  });

  it('calls anon API with encoded token', async () => {
    const response = { id: 1, email: 'a@b.com' };
    const token = 'a.b/c+=d';

    anonGetMock.mockResolvedValue(response);

    const result = await activateAccount(token);

    expect(anonGetMock).toHaveBeenCalledTimes(1);
    expect(anonGetMock).toHaveBeenCalledWith(
      `/api/anonApi/auth/activate/${encodeURIComponent(token)}`,
    );
    expect(result).toEqual(response);
  });

  it('passes backend errors through', async () => {
    anonGetMock.mockRejectedValue(new Error('Activation link has expired'));

    await expect(activateAccount('t')).rejects.toThrow(
      'Activation link has expired',
    );
  });
});
