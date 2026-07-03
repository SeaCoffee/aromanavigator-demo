import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REQUEST_PATH_HEADER } from '@/app/constants/requestHeaders';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  requestHeaders.set(REQUEST_PATH_HEADER, path);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
