import { NextRequest, NextResponse } from 'next/server';

const PREV_ROUTE_COOKIE = 'zamp_prev_route';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const PUBLIC_ROUTES = [
  '/api/health-check',
  '/_next',
  '/favicon.ico',
  '/public',
  '/icons',
  '/auth',
  '/login',
  '/mp4/zamp-login-bg.mp4',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function setPrevRouteCookie(response: NextResponse, route: string): void {
  response.cookies.set(PREV_ROUTE_COOKIE, route, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

function getPrevRouteCookie(request: NextRequest): string | undefined {
  return request.cookies.get(PREV_ROUTE_COOKIE)?.value;
}

function clearPrevRouteCookie(response: NextResponse): void {
  response.cookies.delete(PREV_ROUTE_COOKIE);
}

async function validateSession(request: NextRequest): Promise<boolean> {
  try {
    // const apiBaseUrl = process.env.NEXT_PUBLIC_DEV_API_URL || 'https://api-dev-aws-us.zamp.ai';

    // const cookieHeader = Array.from(request.cookies.getAll())
    //   .map((cookie) => `${cookie.name}=${cookie.value}`)
    //   .join('; ');

    const oryKratosSession = request.cookies.get('ory_kratos_session')?.value;

    return !!oryKratosSession;

    // const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
    //   method: 'GET',
    //   headers: {
    //     Accept: 'application/json',
    //     Cookie: cookieHeader,
    //   },
    //   credentials: 'include',
    // });

    // console.log('responseeee', request.cookies.getAll());

    // return response.ok;
  } catch (error) {
    console.error('Session validation error:', error);

    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = await validateSession(request);

  if (isAuthenticated) {
    switch (pathname) {
      case '/login':
        return NextResponse.redirect(new URL('/', request.url));
      case '/': {
        const prevRoute = getPrevRouteCookie(request);

        if (prevRoute) {
          const response = NextResponse.redirect(new URL(prevRoute, request.url));

          clearPrevRouteCookie(response);

          return response;
        }

        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    if (!['/', '/login', '/sw.js'].includes(pathname)) {
      setPrevRouteCookie(response, pathname);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
