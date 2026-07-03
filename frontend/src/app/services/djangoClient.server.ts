import 'server-only';

import { readServerAccessToken } from '@/app/services/serverAuthTokens';
import { proxyDjango } from '@/app/utils/proxyDjango';
import { ApiError, AUTH_REQUIRED_MESSAGE } from '@/errors/ApiError';
import { isPlainRecord } from '@/app/utils/valueUtils';

import type { ApiErrorPayload } from '@/app/types/apiTypes';

type AuthMode = 'none' | 'auto' | 'required';

type DjangoJsonInit<TJson = unknown> = Omit<RequestInit, 'body'> & {
  json?: TJson;
  auth?: AuthMode;
};

type DjangoFormDataInit = Omit<RequestInit, 'body'> & {
  formData: FormData;
  auth?: AuthMode;
};

function toApiErrorPayload(
  data: unknown,
  fallbackDetail: string,
): ApiErrorPayload {
  if (isPlainRecord(data)) {
    return data as ApiErrorPayload;
  }

  if (typeof data === 'string' && data.trim()) {
    return { detail: data } as ApiErrorPayload;
  }

  return { detail: fallbackDetail } as ApiErrorPayload;
}

async function applyServerAuth(
  headers: Headers,
  auth: AuthMode = 'none',
  path = '',
): Promise<boolean> {
  if (auth === 'none') {
    return false;
  }

  const access = await readServerAccessToken();

  if (access) {
    headers.set('authorization', `Bearer ${access}`);
    return true;
  }

  if (auth === 'required') {
    throw new ApiError({
      status: 401,
      statusText: 'Authentication required',
      url: path,
      data: { detail: AUTH_REQUIRED_MESSAGE } as ApiErrorPayload,
    });
  }

  return false;
}

function throwProxyError(path: string, statusText = 'Proxy failed'): never {
  throw new ApiError({
    status: 500,
    statusText,
    url: path,
    data: { detail: statusText } as ApiErrorPayload,
  });
}

function throwUpstreamError(
  path: string,
  res: Awaited<ReturnType<typeof proxyDjango>>,
): never {
  if (!res.r) {
    throwProxyError(path, res.error?.message ?? 'Proxy failed');
  }

  const fallbackDetail = res.text?.trim() || 'Upstream error';

  if (process.env.DJANGO_CLIENT_DEBUG === '1') {
    console.log('djangoClient error path=', path);
    console.log('djangoClient error status=', res.r.status);
    console.log('djangoClient error statusText=', res.r.statusText);
    console.log('djangoClient error data=', res.data);
    console.log('djangoClient error text=', res.text);
  }

  throw new ApiError({
    status: res.r.status,
    statusText: res.r.statusText,
    url: path,
    data: toApiErrorPayload(res.data, fallbackDetail),
  });
}

export async function djangoJson<T, TJson = unknown>(
  path: string,
  init: DjangoJsonInit<TJson> = {},
): Promise<T> {
  const { json, auth = 'none', headers: initHeaders, ...requestInit } = init;

  const headers = new Headers(initHeaders ?? {});

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const hasAuthorization = await applyServerAuth(headers, auth, path);

  let res = await proxyDjango(path, {
    ...requestInit,
    headers,
    json,
  });

  if (auth === 'auto' && hasAuthorization && res.r?.status === 401) {
    const anonymousHeaders = new Headers(headers);
    anonymousHeaders.delete('authorization');

    res = await proxyDjango(path, {
      ...requestInit,
      headers: anonymousHeaders,
      json,
    });
  }

  if (!res.r) {
    throwProxyError(path, res.error?.message ?? 'Proxy failed');
  }

  if (!res.r.ok) {
    throwUpstreamError(path, res);
  }

  return res.data as T;
}

export async function djangoFormData<T>(
  path: string,
  init: DjangoFormDataInit,
): Promise<T> {
  const { formData, auth = 'none', headers: initHeaders, ...requestInit } = init;

  const headers = new Headers(initHeaders ?? {});

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  /**
   * Р’Р°Р¶Р»РёРІРѕ:
   * multipart/form-data РЅРµ РјРѕР¶РЅР° Р·Р°РґР°РІР°С‚Рё РІСЂСѓС‡РЅСѓ.
   * Boundary РјР°С” РІРёСЃС‚Р°РІРёС‚Рё fetch/runtime.
   */
  headers.delete('content-type');

  const hasAuthorization = await applyServerAuth(headers, auth, path);

  let res = await proxyDjango(path, {
    ...requestInit,
    headers,
    body: formData,
  });

  if (auth === 'auto' && hasAuthorization && res.r?.status === 401) {
    const anonymousHeaders = new Headers(headers);
    anonymousHeaders.delete('authorization');

    res = await proxyDjango(path, {
      ...requestInit,
      headers: anonymousHeaders,
      body: formData,
    });
  }

  if (!res.r) {
    throwProxyError(path, res.error?.message ?? 'Proxy failed');
  }

  if (!res.r.ok) {
    throwUpstreamError(path, res);
  }

  return res.data as T;
}
