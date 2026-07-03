import { describe, expect, it } from 'vitest';

import { ApiError, getApiErrorMessage } from '@/errors/ApiError';
import {
  USER_ERROR_MESSAGES,
  toUserFacingMessage,
} from '@/errors/userFacingErrors';

describe('user-facing error messages', () => {
  it('cleans Django ValidationError list strings', () => {
    const error = new ApiError({
      status: 400,
      statusText: 'Bad Request',
      url: '/orders/',
      data: { detail: "['РўРѕРІР°СЂ РЅРµРґРѕСЃС‚СѓРїРЅРёР№.']" },
    });

    expect(getApiErrorMessage(error)).toBe('РўРѕРІР°СЂ РЅРµРґРѕСЃС‚СѓРїРЅРёР№.');
  });

  it('localizes auth errors', () => {
    expect(toUserFacingMessage('No access token')).toBe(
      USER_ERROR_MESSAGES.authRequired,
    );

    expect(
      toUserFacingMessage('Authentication credentials were not provided.'),
    ).toBe(USER_ERROR_MESSAGES.authRequired);
  });

  it('localizes common validation and network errors', () => {
    expect(toUserFacingMessage('This field is required.')).toBe(
      USER_ERROR_MESSAGES.validation,
    );

    expect(toUserFacingMessage('Enter a valid fragrance ID.')).toBe(
      USER_ERROR_MESSAGES.validation,
    );

    expect(toUserFacingMessage('Upstream (Django) unavailable')).toBe(
      USER_ERROR_MESSAGES.serverUnavailable,
    );
    expect(toUserFacingMessage('Upstream error')).toBe(
      USER_ERROR_MESSAGES.serverUnavailable,
    );

    expect(
      toUserFacingMessage('Р’Рё РЅРµ РјРѕР¶РµС‚Рµ РґРѕРґР°С‚Рё РІР»Р°СЃРЅРёР№ С‚РѕРІР°СЂ РґРѕ РєРѕС€РёРєР°.'),
    ).toBe('Р’Р»Р°СЃРЅРµ РѕРіРѕР»РѕС€РµРЅРЅСЏ РЅРµ РјРѕР¶РЅР° РґРѕРґР°С‚Рё РґРѕ РєРѕС€РёРєР°.');

    expect(
      toUserFacingMessage('РќРµ РјРѕР¶РЅР° РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ СЃР°РјРѕРјСѓ СЃРѕР±С–.'),
    ).toBe('РќРµ РјРѕР¶РЅР° Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ РґР»СЏ РІР»Р°СЃРЅРѕРіРѕ РѕРіРѕР»РѕС€РµРЅРЅСЏ.');
  });

  it('normalizes ApiError payloads', () => {
    const error = new ApiError({
      status: 401,
      statusText: 'Unauthorized',
      url: '/userApi/example',
      data: {
        detail: 'No access token',
      },
    });

    expect(getApiErrorMessage(error)).toBe(USER_ERROR_MESSAGES.authRequired);
  });
});
