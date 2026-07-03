// src/app/utils/apiEnv.ts
import { stripTrailingSlashes } from '@/app/utils/urlUtils';

export const DJANGO_URL = stripTrailingSlashes(process.env.DJANGO_URL ?? '');

export function assertDjangoUrl() {
  if (!DJANGO_URL) throw new Error('DJANGO_URL is not set');
  if (!/^https?:\/\//.test(DJANGO_URL)) {
    throw new Error(`DJANGO_URL must be absolute, got: ${DJANGO_URL}`);
  }
  return DJANGO_URL;
}
