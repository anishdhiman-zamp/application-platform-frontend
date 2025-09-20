import { DEVICE_TYPES } from 'constants/common.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import { COOKIE_MAX_AGE, PREV_ROUTE_COOKIE } from 'utils/cookie';

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
  const { device } = userAgent(request);

  if (
    pathname !== ROUTES_PATH.INVALID_SCREEN_SIZE &&
    (device.type === DEVICE_TYPES.MOBILE || device.type === DEVICE_TYPES.TABLET)
  ) {
    return NextResponse.redirect(new URL(ROUTES_PATH.INVALID_SCREEN_SIZE, request.url));
  }

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internal routes)
     * - api/health-check (health check endpoint)
     * - auth (authentication routes)
     * - favicon.ico (favicon file)
     * - icons (icon files)
     * - mp4 (video files)
     * - public (public files)
     * - sw.js (service worker)
     */
    '/((?!_next/static|_next/image|_vercel|api/health-check|auth|favicon.ico|icons|mp4|public|sw.js).*)',
  ],
};
