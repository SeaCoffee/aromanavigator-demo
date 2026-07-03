import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { DJANGO_API_ROOT } from '@/app/constants/urlsConstants';
import type { ProxyResult } from '@/app/utils/proxyDjango';

export type CatchAllRouteParams = {
  path: string[];
};

export type ParsedProxyBody = {
  jsonBody?: unknown;
  rawBody?: BodyInit;
  contentType: string;
};

const BINARY_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'cache-control',
  'etag',
  'last-modified',
  'content-disposition',
] as const;

export function buildProxyDjangoPath(req: NextRequest, path: string[]) {
  const subPath = path?.join('/') ?? '';
  const basePath = `${DJANGO_API_ROOT}/${subPath}${path?.length === 1 ? '/' : ''}`;
  const search = req.nextUrl.searchParams.toString();

  return search ? `${basePath}?${search}` : basePath;
}

export function optionalFeatureUnavailableResponse(path: string[]) {
  void path;
  return null;
}

export async function parseProxyRequestBody(
  req: NextRequest,
): Promise<ParsedProxyBody> {
  const contentType = req.headers.get('content-type') ?? '';

  if (req.method === 'GET' || req.method === 'HEAD') {
    return { contentType };
  }

  if (contentType.includes('application/json')) {
    return {
      contentType,
      jsonBody: await req.json().catch(() => undefined),
    };
  }

  const buffer = await req.arrayBuffer();

  return {
    contentType,
    rawBody: buffer.byteLength ? Buffer.from(buffer) : undefined,
  };
}

function buildBinaryResponseHeaders(upstream: Response) {
  const headers = new Headers();

  for (const headerName of BINARY_RESPONSE_HEADERS) {
    const value = upstream.headers.get(headerName);

    if (value) {
      headers.set(headerName, value);
    }
  }

  return headers;
}

export function proxyResultToNextResponse(
  result: ProxyResult,
  options: {
    djangoPath?: string;
  } = {},
) {
  const { r, data, text, body, error } = result;

  if (!r) {
    const status = error?.kind === 'timeout' ? 504 : 503;

    return NextResponse.json(
      {
        detail: 'Upstream Django unavailable',
        error: error?.message ?? text ?? null,
        ...(options.djangoPath ? { path: options.djangoPath } : {}),
      },
      { status },
    );
  }

  if (r.status === 204 || r.status === 205 || r.status === 304) {
    return new NextResponse(null, { status: r.status });
  }

  if (body) {
    return new NextResponse(body, {
      status: r.status,
      statusText: r.statusText,
      headers: buildBinaryResponseHeaders(r),
    });
  }

  const contentType = r.headers.get('content-type') ?? 'application/json';

  if (data != null) {
    return NextResponse.json(data, {
      status: r.status,
      headers: {
        'content-type': contentType,
      },
    });
  }

  return new NextResponse(text ?? null, {
    status: r.status,
    headers: {
      'content-type': contentType,
    },
  });
}
