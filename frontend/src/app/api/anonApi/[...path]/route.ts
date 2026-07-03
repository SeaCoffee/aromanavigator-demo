import type { NextRequest } from 'next/server';

import {
  buildProxyDjangoPath,
  optionalFeatureUnavailableResponse,
  proxyResultToNextResponse,
  type CatchAllRouteParams,
} from '@/app/api/_utils/proxyRouteUtils';
import { proxyDjango } from '@/app/utils/proxyDjango';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<CatchAllRouteParams> },
) {
  const { path } = await ctx.params;
  const unavailable = optionalFeatureUnavailableResponse(path);

  if (unavailable) {
    return unavailable;
  }

  const djangoPath = buildProxyDjangoPath(req, path);
  const upstream = await proxyDjango(djangoPath, {
    method: req.method,
  });

  return proxyResultToNextResponse(upstream, { djangoPath });
}
