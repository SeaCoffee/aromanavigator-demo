import { stripTrailingSlashes } from '@/app/utils/urlUtils';

const PRODUCTION_SITE_URL = 'https://aromanavigator.com.ua';
const LOCAL_SITE_URL = 'http://localhost:3000';
const FALLBACK_SITE_URL =
  process.env.NODE_ENV === 'production' ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;

export const SITE_URL =
  stripTrailingSlashes(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      FALLBACK_SITE_URL,
  );

export function siteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${SITE_URL}${cleanPath}`;
}
