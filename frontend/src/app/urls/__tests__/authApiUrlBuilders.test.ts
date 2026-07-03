import { describe, expect, it } from 'vitest';

import { authDjangoApiUrlBuilder } from '@/app/urls/authDjangoApiUrlBuilder';

describe('authDjangoApiUrlBuilder', () => {
  it('builds login url', () => {
    expect(authDjangoApiUrlBuilder.login()).toBe('/userApi/auth/login');
  });

  it('builds logout url', () => {
    expect(authDjangoApiUrlBuilder.logout()).toBe('/userApi/auth/logout');
  });

  it('builds refresh url', () => {
    expect(authDjangoApiUrlBuilder.refresh()).toBe('/userApi/auth/refresh');
  });

  it('builds activation url', () => {
    expect(authDjangoApiUrlBuilder.activate('abc.token')).toBe(
      '/userApi/auth/activate/abc.token',
    );
  });

  it('encodes activation token safely', () => {
    expect(authDjangoApiUrlBuilder.activate('abc/token value')).toBe(
      '/userApi/auth/activate/abc%2Ftoken%20value',
    );
  });

  it('builds recovery request url', () => {
    expect(authDjangoApiUrlBuilder.recovery.request()).toBe(
      '/userApi/auth/recovery',
    );
  });

  it('builds recovery token url', () => {
    expect(authDjangoApiUrlBuilder.recovery.withToken('reset.token')).toBe(
      '/userApi/auth/recovery/reset.token',
    );
  });

  it('builds google auth url', () => {
    expect(authDjangoApiUrlBuilder.social.google()).toBe('/userApi/auth/google');
  });

  it('builds register url from users app', () => {
    expect(authDjangoApiUrlBuilder.register()).toBe('/userApi/users/register');
  });
});
