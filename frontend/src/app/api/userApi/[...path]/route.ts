import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  buildProxyDjangoPath,
  optionalFeatureUnavailableResponse,
  parseProxyRequestBody,
  proxyResultToNextResponse,
  type CatchAllRouteParams,
  type ParsedProxyBody,
} from '@/app/api/_utils/proxyRouteUtils';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/app/constants/cookies_constants';
import { DJANGO_API_ROOT } from '@/app/constants/urlsConstants';
import {
  clearAuthCookiesOnResponse,
  setAuthCookiesOnResponse,
} from '@/app/lib/authCookies';
import {
  djangoRefresh,
  pickAuthTokens,
} from '@/app/services/authServerServices';
import { proxyDjango, type ProxyResult } from '@/app/utils/proxyDjango';

export const runtime = 'nodejs';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  return handle(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  return handle(req, path);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  return handle(req, path);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  return handle(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  return handle(req, path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    },
  });
}

function hasTrustedRequestOrigin(req: NextRequest) {
  if (!MUTATING_METHODS.has(req.method)) {
    return true;
  }

  const trustedOrigins = new Set([req.nextUrl.origin]);
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');

  if (forwardedHost && forwardedProto) {
    trustedOrigins.add(`${forwardedProto}://${forwardedHost}`);
  }

  const origin = req.headers.get('origin');

  if (origin) {
    return trustedOrigins.has(origin);
  }

  const fetchSite = req.headers.get('sec-fetch-site');

  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) {
    return false;
  }

  const referer = req.headers.get('referer');

  if (!referer) {
    return true;
  }

  try {
    return trustedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

function shouldTryRefresh(djangoPath: string, response: ProxyResult) {
  if (response.r?.status !== 401) {
    return false;
  }

  return !djangoPath.startsWith(`${DJANGO_API_ROOT}/auth/`);
}

function buildUpstreamHeaders(access: string, body: ParsedProxyBody) {
  const headers: Record<string, string> = {};

  if (access) {
    headers.authorization = `Bearer ${access}`;
  }

  if (body.rawBody && body.contentType) {
    headers['content-type'] = body.contentType;
  }

  return headers;
}

async function requestUpstream(
  req: NextRequest,
  djangoPath: string,
  body: ParsedProxyBody,
  access: string,
) {
  return proxyDjango(djangoPath, {
    method: req.method,
    json: body.jsonBody,
    body: body.rawBody,
    headers: buildUpstreamHeaders(access, body),
  });
}

async function handle(req: NextRequest, path: string[]) {
  const unavailable = optionalFeatureUnavailableResponse(path);

  if (unavailable) {
    return unavailable;
  }

  if (!hasTrustedRequestOrigin(req)) {
    return NextResponse.json(
      { detail: 'РќРµРґРѕРІС–СЂРµРЅРµ РґР¶РµСЂРµР»Рѕ Р·Р°РїРёС‚Сѓ.' },
      { status: 403 },
    );
  }

  const djangoPath = buildProxyDjangoPath(req, path);
  const body = await parseProxyRequestBody(req);

  const access = req.cookies.get(ACCESS_COOKIE)?.value ?? '';
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value ?? '';

  let upstream = await requestUpstream(req, djangoPath, body, access);

  if (refresh && shouldTryRefresh(djangoPath, upstream)) {
    const refreshResponse = await djangoRefresh(refresh);

    if (refreshResponse.r?.ok) {
      const tokens = pickAuthTokens(refreshResponse.data);

      if (tokens.access) {
        upstream = await requestUpstream(req, djangoPath, body, tokens.access);

        const response = proxyResultToNextResponse(upstream);

        setAuthCookiesOnResponse(response, {
          access: tokens.access,
          refresh: tokens.refresh ?? refresh,
        });

        return response;
      }
    }

    const response = proxyResultToNextResponse(upstream);
    clearAuthCookiesOnResponse(response);
    return response;
  }

  return proxyResultToNextResponse(upstream);
}
