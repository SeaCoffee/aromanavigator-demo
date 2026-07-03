import 'server-only';

import { headers as nextHeaders } from 'next/headers';

import { assertDjangoUrl } from '@/app/utils/apiEnv';
import { stripLeadingSlashes } from '@/app/utils/urlUtils';
import { stringifyJson } from '@/app/utils/valueUtils';

type ProxyInit = RequestInit & {
  json?: unknown;
  timeoutMs?: number;
};

export type ProxyResult = {
  r: Response | null;
  data: unknown;
  text: string | null;
  body?: ReadableStream<Uint8Array> | null;
  error?: {
    kind: 'network' | 'timeout' | 'unknown';
    message: string;
    cause?: unknown;
  };
};

function abortableFetch(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
}

function firstHeaderIp(value: string | null): string {
  if (!value) {
    return '';
  }

  return (
    value
      .split(',')
      .map((item) => item.trim())
      .find(Boolean) ?? ''
  );
}

function setHeaderIfMissing(headers: Headers, name: string, value: string | null) {
  const normalizedValue = (value ?? '').trim();

  if (!normalizedValue) {
    return;
  }

  if (headers.has(name)) {
    return;
  }

  headers.set(name, normalizedValue);
}

async function readIncomingHeaders(): Promise<Headers | null> {
  try {
    return await nextHeaders();
  } catch {
    return null;
  }
}

async function applyForwardedRequestHeaders(headers: Headers) {
  const incomingHeaders = await readIncomingHeaders();

  if (!incomingHeaders) {
    return;
  }

  const forwardedFor = incomingHeaders.get('x-forwarded-for');
  const realIp = incomingHeaders.get('x-real-ip') || firstHeaderIp(forwardedFor);

  const forwardedProto = incomingHeaders.get('x-forwarded-proto');
  const forwardedHost =
    incomingHeaders.get('x-forwarded-host') || incomingHeaders.get('host');

  const userAgent = incomingHeaders.get('user-agent');

  setHeaderIfMissing(headers, 'x-forwarded-for', forwardedFor || realIp);
  setHeaderIfMissing(headers, 'x-real-ip', realIp);
  setHeaderIfMissing(headers, 'x-forwarded-proto', forwardedProto);
  setHeaderIfMissing(headers, 'x-forwarded-host', forwardedHost);
  setHeaderIfMissing(headers, 'user-agent', userAgent);
}

function isBinaryResponse(r: Response): boolean {
  const contentType = (r.headers.get('content-type') ?? '').toLowerCase();
  const contentDisposition = (
    r.headers.get('content-disposition') ?? ''
  ).toLowerCase();

  return (
    contentType.startsWith('image/') ||
    contentType.startsWith('video/') ||
    contentType.startsWith('audio/') ||
    contentType.startsWith('font/') ||
    contentType === 'application/pdf' ||
    contentType === 'application/octet-stream' ||
    contentDisposition.includes('attachment') ||
    contentDisposition.includes('filename=')
  );
}

async function readProxyResponse(r: Response): Promise<{
  data: unknown;
  text: string | null;
  body: ReadableStream<Uint8Array> | null;
}> {
  const contentType = r.headers.get('content-type') ?? '';

  if (isBinaryResponse(r)) {
    return {
      data: null,
      text: null,
      body: r.body,
    };
  }

  if (contentType.includes('application/json')) {
    return {
      data: await r.json().catch(() => null),
      text: null,
      body: null,
    };
  }

  return {
    data: null,
    text: await r.text().catch(() => null),
    body: null,
  };
}

export async function proxyDjango(
  path: string,
  init: ProxyInit = {},
): Promise<ProxyResult> {
  const BASE = assertDjangoUrl();
  const url = `${BASE}/${stripLeadingSlashes(path)}`;

  const {
    json,
    timeoutMs = 12_000,
    headers: initHeaders,
    ...requestInit
  } = init;

  if (process.env.DJANGO_PROXY_DEBUG === '1') {
    console.log('proxyDjango', requestInit.method ?? 'GET', url);
  }

  const headers = new Headers(initHeaders ?? {});

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  await applyForwardedRequestHeaders(headers);

  let body = requestInit.body;

  if (json !== undefined) {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    body = stringifyJson(json);
  }

  try {
    const r = await abortableFetch(
      url,
      {
        ...requestInit,
        headers,
        body,
        cache: requestInit.cache ?? 'no-store',
      },
      timeoutMs,
    );

    const { data, text, body: responseBody } = await readProxyResponse(r);

    if (process.env.DJANGO_PROXY_DEBUG === '1') {
      const debugHeaders = {
        xForwardedFor: headers.get('x-forwarded-for'),
        xRealIp: headers.get('x-real-ip'),
        xForwardedProto: headers.get('x-forwarded-proto'),
        xForwardedHost: headers.get('x-forwarded-host'),
        userAgent: headers.get('user-agent'),
      };

      console.log('proxyDjango forwarded headers=', debugHeaders);
    }

    return { r, data, text, body: responseBody };
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; cause?: unknown };
    const message = String(err?.message ?? e ?? 'fetch failed');

    if (err?.name === 'AbortError') {
      return {
        r: null,
        data: null,
        text: message,
        body: null,
        error: {
          kind: 'timeout',
          message,
          cause: e,
        },
      };
    }

    return {
      r: null,
      data: null,
      text: message,
      body: null,
      error: {
        kind: 'network',
        message,
        cause: e,
      },
    };
  }
}
