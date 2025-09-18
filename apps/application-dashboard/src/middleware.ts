import { ROUTES_PATH } from 'constants/routeConfig';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_MAX_AGE, PREV_ROUTE_COOKIE } from 'utils/cookie';

const PUBLIC_ROUTES = [
  '/_next',
  '/_vercel',
  '/api/health-check',
  '/auth',
  '/favicon.ico',
  '/icons',
  '/mp4/zamp-login-bg.mp4',
  '/public',
  '/sw.js',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function setPrevRouteCookie(response: NextResponse, route: string): void {
  response.cookies.set(PREV_ROUTE_COOKIE, route, {
    httpOnly: false,
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
    const oryKratosSession = request.cookies.get('ory_kratos_session')?.value;

    return !!oryKratosSession;
  } catch (error) {
    console.error('Session validation error:', error);

    return false;
  }
}

const handleUnauthenticatedRoutes = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (pathname === ROUTES_PATH.LOGIN) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ROUTES_PATH.LOGIN, request.url);
  const response = NextResponse.redirect(loginUrl);

  if (![ROUTES_PATH.HOME, ROUTES_PATH.LOGIN].includes(pathname)) {
    const fullRoute = pathname + (request.nextUrl.search || '');

    setPrevRouteCookie(response, fullRoute);
  }

  return response;
};

const handleAuthenticatedRoutes = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  switch (pathname) {
    case ROUTES_PATH.LOGIN:
      return NextResponse.redirect(new URL(ROUTES_PATH.PROCESSES, request.url));
    case ROUTES_PATH.HOME: {
      const prevRoute = getPrevRouteCookie(request);

      if (prevRoute) {
        const response = NextResponse.redirect(new URL(prevRoute, request.url));

        clearPrevRouteCookie(response);

        return response;
      }

      return NextResponse.redirect(new URL(ROUTES_PATH.PROCESSES, request.url));
    }
    default:
      return NextResponse.next();
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = await validateSession(request);

  if (!isAuthenticated) {
    return handleUnauthenticatedRoutes(request);
  }

  return handleAuthenticatedRoutes(request);
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
