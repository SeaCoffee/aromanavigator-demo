import {
  DJANGO_API_ROOT,
  DJANGO_MEDIA_ROOT,
  DJANGO_PUBLIC_MEDIA_ROOT,
  NEXT_MEDIA_API_ROOT,
  NEXT_USER_API_ROOT,
} from '@/app/constants/urlsConstants';

const DJANGO_USER_API_PREFIX = `${DJANGO_API_ROOT}/`;
const NEXT_USER_API_PREFIX = `${NEXT_USER_API_ROOT}/`;
const DJANGO_PUBLIC_MEDIA_PREFIX = `${DJANGO_PUBLIC_MEDIA_ROOT}/`;
const DJANGO_MEDIA_PREFIX = `${DJANGO_MEDIA_ROOT}/`;
const NEXT_MEDIA_PREFIX = `${NEXT_MEDIA_API_ROOT}/`;

function replacePathPrefix(pathname: string): string {
  if (pathname.startsWith(NEXT_MEDIA_PREFIX)) {
    return pathname.replace(NEXT_MEDIA_PREFIX, DJANGO_PUBLIC_MEDIA_PREFIX);
  }

  if (pathname.startsWith(NEXT_USER_API_PREFIX)) {
    return pathname;
  }

  if (pathname.startsWith(DJANGO_PUBLIC_MEDIA_PREFIX)) {
    return pathname;
  }

  if (pathname.startsWith(DJANGO_MEDIA_PREFIX)) {
    return pathname.replace(DJANGO_MEDIA_PREFIX, DJANGO_PUBLIC_MEDIA_PREFIX);
  }

  if (pathname.startsWith(DJANGO_USER_API_PREFIX)) {
    return pathname.replace(DJANGO_USER_API_PREFIX, NEXT_USER_API_PREFIX);
  }

  return pathname;
}

export function toProtectedNextApiUrl(url: string): string {
  if (!url) {
    return '';
  }

  if (url.startsWith('/')) {
    return replacePathPrefix(url);
  }

  try {
    const parsed = new URL(url);
    const nextPath = replacePathPrefix(parsed.pathname);

    if (
      nextPath !== parsed.pathname ||
      parsed.pathname.startsWith(DJANGO_PUBLIC_MEDIA_PREFIX) ||
      parsed.pathname.startsWith(DJANGO_MEDIA_PREFIX)
    ) {
      return `${nextPath}${parsed.search}`;
    }

    return url;
  } catch {
    return url;
  }
}

function readMediaCandidate(value: unknown, depth = 0): string {
  if (!value || depth > 3) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = readMediaCandidate(item, depth + 1);

      if (candidate) {
        return candidate;
      }
    }

    return '';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    return (
      readMediaCandidate(record.cover_image, depth + 1) ||
      readMediaCandidate(record.image_url, depth + 1) ||
      readMediaCandidate(record.avatar_url, depth + 1) ||
      readMediaCandidate(record.cover, depth + 1) ||
      readMediaCandidate(record.image, depth + 1) ||
      readMediaCandidate(record.url, depth + 1) ||
      readMediaCandidate(record.photos, depth + 1)
    );
  }

  return '';
}

export function normalizeMediaUrl(url: string | null | undefined): string {
  const cleanUrl = (url || '').trim();

  return cleanUrl ? toProtectedNextApiUrl(cleanUrl) : '';
}

export function pickMediaUrl(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    const url = readMediaCandidate(candidate);

    if (url) {
      return normalizeMediaUrl(url);
    }
  }

  return '';
}
