import { ApiError } from '@/errors/ApiError';
import { API_BASE } from '@/app/constants/urlsConstants';
import { stringifyJson } from '@/app/utils/valueUtils';
import type { ApiErrorPayload, Json, RequestInitEx } from '@/app/types/apiTypes';

function buildHeaders(init?: RequestInitEx): Headers {
  const headers = new Headers(init?.headers ?? {});

  if (init?.json !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  return headers;
}

function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/')) {
    if (typeof document === 'undefined') {
      if (!API_BASE) throw new Error('API_BASE is not set for server-side fetch');
      return `${API_BASE}${url}`;
    }

    return url;
  }

  return url;
}

async function doFetch(
  url: string,
  init: RequestInitEx = {},
  credentials: RequestCredentials = 'include',
): Promise<Response> {
  const headers = buildHeaders(init);
  const body = init.json !== undefined ? stringifyJson(init.json) : init.body;

  return fetch(toAbsoluteUrl(url), {
    ...init,
    headers,
    body,
    cache: init.cache ?? 'no-store',
    credentials: init.credentials ?? credentials,
  });
}

async function readJsonResponse<T>(res: Response): Promise<T | undefined> {
  const contentType = res.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return undefined;
  }

  return (await res.json().catch(() => undefined)) as T | undefined;
}

async function jsonStrict<T = unknown>(url: string, init?: RequestInitEx): Promise<T> {
  const res = await doFetch(url, init);
  const data = await readJsonResponse<ApiErrorPayload>(res);

  if (!res.ok) {
    throw new ApiError<ApiErrorPayload>({
      status: res.status,
      statusText: res.statusText,
      url,
      data: data ?? {},
    });
  }

  return data as T;
}

async function jsonSafe<T = unknown>(url: string, init?: RequestInitEx) {
  const res = await doFetch(url, init);
  const data = await readJsonResponse<T>(res);

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    data,
    res,
  };
}

export const userApi = {
  get: <T>(url: string, init?: RequestInitEx) =>
    jsonStrict<T>(url, { ...init, method: 'GET' }),
  post: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrict<T>(url, { ...init, method: 'POST' }),
  patch: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrict<T>(url, { ...init, method: 'PATCH' }),
  put: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrict<T>(url, { ...init, method: 'PUT' }),
  delete: <T>(url: string, init?: RequestInitEx) =>
    jsonStrict<T>(url, { ...init, method: 'DELETE' }),

  safeGet: <T>(url: string, init?: RequestInitEx) =>
    jsonSafe<T>(url, { ...init, method: 'GET' }),
  safePost: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafe<T>(url, { ...init, method: 'POST' }),
  safePatch: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafe<T>(url, { ...init, method: 'PATCH' }),
  safePut: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafe<T>(url, { ...init, method: 'PUT' }),
  safeDelete: <T>(url: string, init?: RequestInitEx) =>
    jsonSafe<T>(url, { ...init, method: 'DELETE' }),
};

async function jsonStrictNoAuth<T = unknown>(
  url: string,
  init?: RequestInitEx,
): Promise<T> {
  const res = await doFetch(url, init, 'omit');
  const data = await readJsonResponse<ApiErrorPayload>(res);

  if (!res.ok) {
    throw new ApiError<ApiErrorPayload>({
      status: res.status,
      statusText: res.statusText,
      url,
      data: data ?? {},
    });
  }

  return data as T;
}

async function jsonSafeNoAuth<T = unknown>(url: string, init?: RequestInitEx) {
  const res = await doFetch(url, init, 'omit');
  const data = await readJsonResponse<T>(res);

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    data,
    res,
  };
}

export const anonApi = {
  get: <T>(url: string, init?: RequestInitEx) =>
    jsonStrictNoAuth<T>(url, { ...init, method: 'GET' }),
  post: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrictNoAuth<T>(url, { ...init, method: 'POST' }),
  patch: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrictNoAuth<T>(url, { ...init, method: 'PATCH' }),
  put: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonStrictNoAuth<T>(url, { ...init, method: 'PUT' }),
  delete: <T>(url: string, init?: RequestInitEx) =>
    jsonStrictNoAuth<T>(url, { ...init, method: 'DELETE' }),

  safeGet: <T>(url: string, init?: RequestInitEx) =>
    jsonSafeNoAuth<T>(url, { ...init, method: 'GET' }),
  safePost: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafeNoAuth<T>(url, { ...init, method: 'POST' }),
  safePatch: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafeNoAuth<T>(url, { ...init, method: 'PATCH' }),
  safePut: <T, TJson = Json>(url: string, init?: RequestInitEx<TJson>) =>
    jsonSafeNoAuth<T>(url, { ...init, method: 'PUT' }),
  safeDelete: <T>(url: string, init?: RequestInitEx) =>
    jsonSafeNoAuth<T>(url, { ...init, method: 'DELETE' }),
};
