import type { NextRequest, NextResponse } from 'next/server';
import { Session } from 'types/api/auth.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { PROVISIONING_STATUS } from '@/modules/setup-workspace/setup-workspace.types';
import { ORY_KRATOS_SESSION_COOKIE, USER_SESSION_COOKIE } from '@/utils/cookie';

type SessionCache = {
  user_id: string;
  user_name: string;
  last_name: string;
  user_email: string;
  org_count: number;
  cached_at: number;
  username: string;
  provisioning_status?: string;
};

export function buildSessionCache(session: Session) {
  return {
    user_id: session.user_id,
    user_email: session.user_email,
    org_count: session.orgs?.length ?? 0,
    default_org_id: session.orgs?.[0]?.organization_id,
    cached_at: Date.now(),
    username: session.username,
    provisioning_status: session.orgs?.[0]?.provisioning_status,
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
  const cachedSessionData = getServerSideCookie(request, USER_SESSION_COOKIE, true) as SessionCache | null;

  if (cachedSessionData && checkCache) {
    const now = Date.now();
    const cacheAge = now - cachedSessionData.cached_at;
    const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (cacheAge < maxAge) {
      const orgs = Array.from({ length: cachedSessionData.org_count }, () => ({
        organization_id: '',
        name: '',
        slug: '',
        provisioning_status: 'completed',
        resource_audience_policies: [],
        ...(cachedSessionData.provisioning_status && { provisioning_status: cachedSessionData.provisioning_status }),
      }));

      const session: Session = {
        user_id: cachedSessionData.user_id,
        user_email: cachedSessionData.user_email,
        orgs,
        workspaces: [],
        organization_id: { workspace_id: '', name: '', description: '' },
        user_name: cachedSessionData.user_name ?? '',
        display_name: cachedSessionData.user_name ?? '',
        last_name: cachedSessionData.last_name ?? '',
        username: cachedSessionData.username ?? '',
        onboarding_status: null,
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

export function checkOrgMembership(session: Session | null, pathname: string): boolean {
  if (!session) return false;

  const orgs = session.orgs;

  if (!orgs || !Array.isArray(orgs)) return false;

  return orgs.length === 0 && !pathname.includes(ROUTES_PATH.INVITATIONS) && !pathname.includes(ROUTES_PATH.ONBOARDING);
}

/**
 * Returns true if the user needs the setup-workspace flow:
 * - No orgs at all (and not on invitations page)
 * - Has orgs but primary org is not yet provisioned
 */
export function needsWorkspaceSetup(session: Session | null, pathname: string): boolean {
  if (!session) return false;

  // No orgs → needs setup
  if (checkOrgMembership(session, pathname)) return true;

  // Has orgs but not yet provisioned → needs setup
  // Flag-off users will bounce: setup-workspace → client checks flag → membership-pending (no loop)
  const primaryOrg = session.orgs?.[0];

  if (primaryOrg?.provisioning_status && primaryOrg.provisioning_status !== PROVISIONING_STATUS.COMPLETED) return true;

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
