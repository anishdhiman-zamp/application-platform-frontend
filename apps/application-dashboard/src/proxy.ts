import { DEVICE_TYPES, ENVIRONMENT, ENVIRONMENT_TYPES } from 'constants/common.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import {
  ACTIVE_ORG_ID_COOKIE,
  COOKIE_MAX_AGE,
  ORY_KRATOS_SESSION_COOKIE,
  PREV_ROUTE_COOKIE,
  SESSION_CACHE_MAX_AGE,
  SESSION_COOKIE_NAMES,
  USER_SESSION_COOKIE,
} from 'utils/cookie';
import { DOMAINS } from '@/constants/domains';
import { OnboardingStatus } from '@/modules/onboarding/onboarding.types';
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

export const BETA_ORG_IDS = new Set(
  (process.env.BETA_ORG_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const CANARY_COOKIE = 'org_is_beta';
const IS_CANARY_DEPLOYMENT = process.env.IS_CANARY === 'true';
const CANARY_URL = process.env.CANARY_URL ?? '';

const applyCanaryRoutingCookie = (request: NextRequest, response: NextResponse): void => {
  // Skip on the canary deployment itself — it doesn't route anywhere else
  if (IS_CANARY_DEPLOYMENT) return;
  if (request.nextUrl.pathname.startsWith('/api/')) return;

  const orgId = getServerSideCookie(request, ACTIVE_ORG_ID_COOKIE);
  const cookieDomain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';

  if (orgId && BETA_ORG_IDS.has(orgId)) {
    response.cookies.set(CANARY_COOKIE, 'true', {
      path: '/',
      sameSite: 'lax',
      secure: true,
      domain: cookieDomain,
    });
  } else {
    response.cookies.delete({ name: CANARY_COOKIE, path: '/', domain: cookieDomain });
  }
};

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

  const isExemptRoute = [
    ROUTES_PATH.MEMBERSHIP_PENDING,
    ROUTES_PATH.LOGIN,
    ROUTES_PATH.ONBOARDING,
    ROUTES_PATH.INVITATIONS,
  ].includes(pathname);

  if (!isExemptRoute) {
    const userSession = await getUserSession(request);
    const { cached } = userSession;
    let { session } = userSession;

    topLevelSession = session;

    // User hasn't completed onboarding → send to onboarding flow
    // If using cached session, re-fetch fresh to avoid stale redirect after onboarding completes
    if (session?.onboarding_status && session.onboarding_status !== OnboardingStatus.ONBOARDED) {
      if (cached) {
        ({ session } = await getUserSession(request, false));
      }

      if (session?.onboarding_status && session.onboarding_status !== OnboardingStatus.ONBOARDED) {
        const response = NextResponse.redirect(new URL(ROUTES_PATH.ONBOARDING, request.url));

        setServerSideUserCookie(
          response,
          USER_SESSION_COOKIE,
          JSON.stringify(buildSessionCache(request, session)),
          SESSION_CACHE_MAX_AGE,
        );

        return response;
      }
    }

    // No orgs or active org not yet provisioned → send to setup-workspace.
    // Skip when already there to avoid a self-redirect loop.
    if (pathname !== ROUTES_PATH.SETUP_WORKSPACE && needsWorkspaceSetup(session, pathname, request)) {
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
      const domain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';
      const decodedPrevRoute = decodeURIComponent(prevRoute);

      const response = NextResponse.redirect(new URL(decodedPrevRoute, request.url));

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
        const oryKratosSessionMe = getServerSideCookie(request, SESSION_COOKIE_NAMES.ME_PRODUCTION);

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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Region consolidation: app-us.zamp.ai was retired — permanently redirect to app.zamp.ai,
  // preserving path + query so deep links keep working.
  if (request.headers.get('host') === DOMAINS.US_PRODUCTION) {
    const target = new URL(request.nextUrl.toString());

    target.host = DOMAINS.PRODUCTION;
    target.protocol = 'https:';
    target.port = '';

    return NextResponse.redirect(target, 308);
  }

  // Derive canary status from the active org directly — more reliable than the cookie
  // which can lag by one request after an org switch.
  const activeOrgId = getServerSideCookie(request, ACTIVE_ORG_ID_COOKIE);
  const isCanary = !IS_CANARY_DEPLOYMENT && CANARY_URL && !!activeOrgId && BETA_ORG_IDS.has(activeOrgId);

  // Static assets bypass auth logic entirely.
  // For canary users, rewrite to canary origin so their chunk hashes resolve correctly.
  if (pathname.startsWith('/_next/')) {
    if (isCanary) {
      return NextResponse.rewrite(new URL(pathname + search, CANARY_URL));
    }

    return NextResponse.next();
  }

  // Rewrite all non-static, non-API requests to canary when org is in beta set.
  if (isCanary && !pathname.startsWith('/api/')) {
    return NextResponse.rewrite(new URL(pathname + search, CANARY_URL));
  }

  const isAuthenticated = validateSession(request);

  if (!isAuthenticated) {
    const response = handleUnauthenticatedRoutes(request);

    applyCanaryRoutingCookie(request, response);

    return response;
  }

  const response = await handleAuthenticatedRoutes(request);

  applyCanaryRoutingCookie(request, response);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all requests EXCEPT:
     * - _vercel (Vercel internal routes)
     * - api/health-check (health check endpoint)
     * - auth (authentication routes)
     * - favicon.ico (favicon file)
     *
     * Note: _next/static and _next/image are intentionally included so canary
     * static assets are served from the canary origin (chunk hashes differ between builds).
     * - icons (icon files)
     * - mp4 (video files)
     * - public (public files)
     * - sw.js (service worker)
     * - monitoring (Sentry tunnel route)
     */
    '/((?!_vercel|api/health-check|auth|favicon.ico|icons|loaders|mp4|public|sw.js|monitoring).*)',
  ],
};
