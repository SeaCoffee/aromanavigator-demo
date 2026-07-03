import { DJANGO_PUBLIC_MEDIA_ROOT } from '@/app/constants/urlsConstants';

function isSafeMediaSegment(segment: string) {
  return Boolean(segment) && segment !== '.' && segment !== '..' && !/[\\/]/.test(segment);
}

export function buildDjangoMediaPath(path: string[]) {
  if (!path.length || path.some((segment) => !isSafeMediaSegment(segment))) {
    return null;
  }

  return `${DJANGO_PUBLIC_MEDIA_ROOT}/${path.map(encodeURIComponent).join('/')}`;
}
