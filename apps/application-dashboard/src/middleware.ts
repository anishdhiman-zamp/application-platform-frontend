import { DEVICE_TYPES, ENVIRONMENT, ENVIRONMENT_TYPES } from 'constants/common.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import {
  COOKIE_MAX_AGE,
  ORY_KRATOS_SESSION_COOKIE,
  PREV_ROUTE_COOKIE,
  SESSION_CACHE_MAX_AGE,
  SESSION_COOKIE_NAMES,
  USER_SESSION_COOKIE,
} from 'utils/cookie';
import { DOMAINS } from '@/constants/domains';
import {
  buildSessionCache,
  clearServerSideCookie,
  getActiveLandingRoute,
  getServerSideCookie,
  getUserSession,
  needsWorkspaceSetup,
  setServerSideUserCookie,
  validateSession,
} from '@/utils/middlware.util';

const handleUnauthenticatedRoutes = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (pathname === ROUTES_PATH.LOGIN) {
    if (request.headers.get('host') === DOMAINS.PRODUCTION) {
      const oryKratosSessionMe = getServerSideCookie(request, SESSION_COOKIE_NAMES.ME_PRODUCTION);

      if (oryKratosSessionMe) {
        return NextResponse.redirect(new URL(`https://${DOMAINS.ME_PRODUCTION}/login`, request.url));
      }
    }

    return NextResponse.next();
  }

  const loginUrl = new URL(ROUTES_PATH.LOGIN, request.url);
  const response = NextResponse.redirect(loginUrl);

  if (![ROUTES_PATH.HOME, ROUTES_PATH.LOGIN].includes(pathname)) {
    const fullRoute = pathname + (request.nextUrl.search || '');

    const domain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';

    setServerSideUserCookie(response, PREV_ROUTE_COOKIE, fullRoute, COOKIE_MAX_AGE, domain);
  }

  return response;
};

const handleAuthenticatedRoutes = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const { device } = userAgent(request);

  if (
    pathname !== ROUTES_PATH.INVALID_SCREEN_SIZE &&
    (device.type === DEVICE_TYPES.MOBILE || device.type === DEVICE_TYPES.TABLET)
  ) {
    return NextResponse.redirect(new URL(ROUTES_PATH.INVALID_SCREEN_SIZE, request.url));
  }

  let topLevelSession = null;

  if (
    pathname !== ROUTES_PATH.MEMBERSHIP_PENDING &&
    pathname !== ROUTES_PATH.SETUP_WORKSPACE &&
    pathname !== ROUTES_PATH.LOGIN
  ) {
    const { session, cached } = await getUserSession(request);

    topLevelSession = session;

    // No orgs or active org not yet provisioned → send to setup-workspace
    if (needsWorkspaceSetup(session, pathname, request)) {
      const response = NextResponse.redirect(new URL(ROUTES_PATH.SETUP_WORKSPACE, request.url));

      if (session) {
        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );
      }

      return response;
    }

    const prevRoute = getServerSideCookie(request, PREV_ROUTE_COOKIE);

    if (prevRoute) {
      const response = NextResponse.redirect(new URL(prevRoute, request.url));

      const domain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';

      clearServerSideCookie(response, PREV_ROUTE_COOKIE, domain);

      if (session && !cached) {
        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );
      }

      return response;
    }

    if (session && !cached) {
      if (pathname === ROUTES_PATH.HOME) {
        const response = NextResponse.redirect(new URL(getActiveLandingRoute(request, session), request.url));

        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );

        return response;
      }

      const response = NextResponse.next();

      setServerSideUserCookie(
        response,
        USER_SESSION_COOKIE,
        JSON.stringify(buildSessionCache(request, session)),
        SESSION_CACHE_MAX_AGE,
      );

      return response;
    }
  }

  switch (pathname) {
    case ROUTES_PATH.LOGIN: {
      // Check region redirects first (no session fetch needed)
      if (request.headers.get('host') === DOMAINS.PRODUCTION) {
        const oryKratosSessionUs = getServerSideCookie(request, SESSION_COOKIE_NAMES.US_PRODUCTION);
        const oryKratosSessionMe = getServerSideCookie(request, SESSION_COOKIE_NAMES.ME_PRODUCTION);

        if (oryKratosSessionUs) {
          return NextResponse.redirect(new URL(`https://${DOMAINS.US_PRODUCTION}/login`, request.url));
        }

        if (oryKratosSessionMe) {
          return NextResponse.redirect(new URL(`https://${DOMAINS.ME_PRODUCTION}/login`, request.url));
        }
      }

      const { session } = await getUserSession(request, false);

      if (session) {
        if (needsWorkspaceSetup(session, pathname, request)) {
          const response = NextResponse.redirect(new URL(ROUTES_PATH.SETUP_WORKSPACE, request.url));

          setServerSideUserCookie(
            response,
            USER_SESSION_COOKIE,
            JSON.stringify(buildSessionCache(request, session)),
            SESSION_CACHE_MAX_AGE,
          );

          return response;
        }

        const response = NextResponse.redirect(new URL(getActiveLandingRoute(request, session), request.url));

        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );

        return response;
      }

      const response = NextResponse.next();

      clearServerSideCookie(response, ORY_KRATOS_SESSION_COOKIE);
      clearServerSideCookie(response, USER_SESSION_COOKIE);

      return response;
    }
    case ROUTES_PATH.MEMBERSHIP_PENDING: {
      const { session } = await getUserSession(request, false);

      const hasOrgs = !!(session && Array.isArray(session.orgs) && session.orgs.length > 0);

      if (hasOrgs && !needsWorkspaceSetup(session, pathname, request)) {
        const response = NextResponse.redirect(new URL(getActiveLandingRoute(request, session), request.url));

        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );

        return response;
      }

      return NextResponse.next();
    }
    case ROUTES_PATH.SETUP_WORKSPACE: {
      const { session } = await getUserSession(request, false);

      // If user doesn't need setup (has provisioned orgs), redirect to app
      // Update the session cache so stale org_count=0 doesn't cause a redirect loop
      if (session && !needsWorkspaceSetup(session, pathname, request)) {
        const response = NextResponse.redirect(new URL(getActiveLandingRoute(request, session), request.url));

        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );

        return response;
      }

      return NextResponse.next();
    }
    case ROUTES_PATH.HOME: {
      const response = NextResponse.redirect(new URL(getActiveLandingRoute(request, topLevelSession), request.url));

      if (topLevelSession) {
        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, topLevelSession)),
          SESSION_CACHE_MAX_AGE,
        );
      }

      return response;
    }
    default:
      return NextResponse.next();
  }
};

export async function middleware(request: NextRequest) {
  const isAuthenticated = validateSession(request);

  if (!isAuthenticated) {
    return handleUnauthenticatedRoutes(request);
  }

  return await handleAuthenticatedRoutes(request);
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
     * - monitoring (Sentry tunnel route)
     */
    '/((?!_next/static|_next/image|_vercel|api/health-check|auth|favicon.ico|icons|loaders|mp4|public|sw.js|monitoring).*)',
  ],
};
