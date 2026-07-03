// frontend/src/app/utils/serverUrlUtils.ts

import 'server-only';

import { headers } from 'next/headers';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function isAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function getRequestOrigin(): Promise<string> {
  const envOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    '';

  if (envOrigin.trim()) {
    return normalizeOrigin(envOrigin);
  }

  const headersList = await headers();

  const forwardedProto = headersList.get('x-forwarded-proto');
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');

  if (!host) {
    return '';
  }

  const proto = forwardedProto?.split(',')[0]?.trim() || 'http';
  const cleanHost = host.split(',')[0]?.trim();

  return `${proto}://${cleanHost}`;
}

export async function buildAbsoluteServerUrl(value: string): Promise<string> {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return '';
  }

  if (isAbsoluteUrl(cleanValue)) {
    return cleanValue;
  }

  const origin = await getRequestOrigin();

  if (!origin) {
    return cleanValue;
  }

  return new URL(cleanValue, origin).toString();
}
