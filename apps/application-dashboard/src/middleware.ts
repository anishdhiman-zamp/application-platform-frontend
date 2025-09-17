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
  '/mp4/zamp-login-bg.mp4',
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

  if (pathname === '/login') {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  if (!['/', '/login'].includes(pathname)) {
    const fullRoute = pathname + (request.nextUrl.search || '');

    setPrevRouteCookie(response, fullRoute);
  }

  return response;
};

const handleAuthenticatedRoutes = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  switch (pathname) {
    case '/login':
      return NextResponse.redirect(new URL('/processes', request.url));
    case '/': {
      const prevRoute = getPrevRouteCookie(request);

      if (prevRoute) {
        const response = NextResponse.redirect(new URL(prevRoute, request.url));

        clearPrevRouteCookie(response);

        return response;
      }

      return NextResponse.redirect(new URL('/processes', request.url));
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
