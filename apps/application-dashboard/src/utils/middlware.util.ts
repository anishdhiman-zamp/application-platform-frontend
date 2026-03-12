import type { NextRequest, NextResponse } from 'next/server';
import { Session, type UserSessionCache } from 'types/api/auth.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { PROVISIONING_STATUS } from '@/modules/setup-workspace/setup-workspace.types';
import { ACTIVE_ORG_ID_COOKIE, ORY_KRATOS_SESSION_COOKIE, USER_SESSION_COOKIE } from '@/utils/cookie';
import { getLandingRoute } from '@/utils/route.util';

export function buildSessionCache(request: NextRequest, session: Session): UserSessionCache {
  const activeOrg = getActiveOrg(request, session);

  return {
    user_id: session.user_id,
    user_name: session.user_name,
    last_name: session.last_name,
    user_email: session.user_email,
    org_count: session.orgs?.length ?? 0,
    default_org_id: activeOrg?.organization_id ?? session.orgs?.[0]?.organization_id,
    cached_at: Date.now(),
    display_name: session.display_name,
    username: session.username,
    provisioning_status: activeOrg?.provisioning_status ?? session.orgs?.[0]?.provisioning_status,
    onboarding_status: session.onboarding_status,
    product: activeOrg?.product ?? session.orgs?.[0]?.product,
  };
}

export function setServerSideUserCookie(
  response: NextResponse,
  cookieId: string,
  value: string,
  maxAge: number,
  domain?: string,
): void {
  response.cookies.set(cookieId, value, {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: maxAge,
    path: '/',
    ...(domain && { domain: domain }),
  });
}

export function getServerSideCookie(request: NextRequest, cookieName: string, parseJson = false): string | null {
  try {
    const cookieValue = request.cookies.get(cookieName)?.value;

    if (!cookieValue) return null;

    return parseJson ? JSON.parse(cookieValue) : cookieValue;
  } catch {
    return null;
  }
}

export function clearServerSideCookie(response: NextResponse, cookieId: string, domain?: string): void {
  // Clear without domain (for legacy cookies)
  response.cookies.set(cookieId, '', {
    maxAge: 0,
    path: '/',
  });

  // Also clear with domain if specified (for domain-scoped cookies)
  if (domain) {
    response.cookies.set(cookieId, '', {
      maxAge: 0,
      path: '/',
      domain: domain,
    });
  }
}

export async function getUserSession(
  request: NextRequest,
  checkCache = true,
): Promise<{ session: Session | null; cached: boolean }> {
  const cachedSessionData = getServerSideCookie(request, USER_SESSION_COOKIE, true) as UserSessionCache | null;

  if (cachedSessionData && checkCache) {
    const now = Date.now();
    const cacheAge = now - cachedSessionData.cached_at;
    const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (cacheAge < maxAge) {
      const orgs = Array.from({ length: cachedSessionData.org_count }, (_, i) => ({
        organization_id: i === 0 ? (cachedSessionData.default_org_id ?? '') : '',
        name: '',
        slug: '',
        resource_audience_policies: [],
        ...(i === 0 &&
          cachedSessionData.provisioning_status && { provisioning_status: cachedSessionData.provisioning_status }),
        ...(i === 0 && cachedSessionData.product && { product: cachedSessionData.product }),
      }));

      const session: Session = {
        user_id: cachedSessionData.user_id,
        user_email: cachedSessionData.user_email,
        orgs,
        workspaces: [],
        organization_id: { workspace_id: '', name: '', description: '' },
        user_name: cachedSessionData.user_name ?? '',
        display_name: cachedSessionData.display_name ?? '',
        last_name: cachedSessionData.last_name ?? '',
        username: cachedSessionData.username ?? '',
        onboarding_status: cachedSessionData.onboarding_status ?? '',
        avatar_type: null,
        avatar_value: null,
      };

      return { session, cached: true };
    }
  }

  try {
    const region = process.env.NEXT_PUBLIC_DEFAULT_REGION;
    const cookieName = `${ORY_KRATOS_SESSION_COOKIE}${region?.length ? '_' + region : ''}`;

    const oryKratosSession = getServerSideCookie(request, cookieName);

    if (!oryKratosSession) {
      return { session: null, cached: true };
    }

    const baseUrl = process.env.NEXT_SERVER_API_URL || process.env.NEXT_PUBLIC_BASE_API_URL;

    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required');
    }

    const response = await fetch(`${baseUrl}/${API_ENDPOINTS.USER_WHOAMI_GET}`, {
      headers: {
        Cookie: `${cookieName}=${oryKratosSession}`,
      },
    });

    if (!response.ok) {
      return { session: null, cached: false };
    }

    const session: Session = await response.json();

    return { session, cached: false };
  } catch {
    return { session: null, cached: false };
  }
}

export function getActiveOrg(request: NextRequest, session: Session | null): Session['orgs'][number] | undefined {
  const activeOrgId = getServerSideCookie(request, ACTIVE_ORG_ID_COOKIE);

  if (activeOrgId && session?.orgs?.length) {
    const matchedOrg = session.orgs.find((org) => org?.organization_id === activeOrgId);

    if (matchedOrg) return matchedOrg;
  }

  return session?.orgs?.[0];
}

export function checkOrgMembership(session: Session | null, pathname: string): boolean {
  if (!session) return false;

  const orgs = session.orgs;

  if (!orgs || !Array.isArray(orgs)) return false;

  return orgs.length === 0 && !pathname.includes(ROUTES_PATH.INVITATIONS);
}

/**
 * Returns true if the user needs the setup-workspace flow:
 * - No orgs at all (and not on invitations page)
 * - Has orgs but primary org is not yet provisioned
 */
export function needsWorkspaceSetup(session: Session | null, pathname: string, request?: NextRequest): boolean {
  if (!session) return false;

  // No orgs → needs setup
  if (checkOrgMembership(session, pathname)) return true;

  // Has orgs but not yet provisioned → needs setup
  // Flag-off users will bounce: setup-workspace → client checks flag → membership-pending (no loop)
  const activeOrg = request ? getActiveOrg(request, session) : session.orgs?.[0];

  if (activeOrg?.provisioning_status && activeOrg.provisioning_status !== PROVISIONING_STATUS.COMPLETED) return true;

  return false;
}

export function validateSession(request: NextRequest): boolean {
  try {
    const region = process.env.NEXT_PUBLIC_DEFAULT_REGION;

    const oryKratosSession = getServerSideCookie(
      request,
      `${ORY_KRATOS_SESSION_COOKIE}${region?.length ? '_' + region : ''}`,
    );

    return !!oryKratosSession;
  } catch {
    return false;
  }
}

/**
 * Returns the correct landing route based on the active org's product mode.
 */
export function getActiveLandingRoute(request: NextRequest, session: Session | null): string {
  const activeOrg = getActiveOrg(request, session);

  return getLandingRoute(activeOrg?.product);
}
