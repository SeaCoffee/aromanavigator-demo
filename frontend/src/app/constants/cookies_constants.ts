// src/app/constants/cookies_constants.ts
export const ACCESS_COOKIE  = 'access';
export const REFRESH_COOKIE = 'refresh';
export const ACCESS_MAX_AGE = 60 * 15;
export const REFRESH_MAX_AGE = 60 * 60 * 24;

export const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
