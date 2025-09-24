import type { NextRequest, NextResponse } from 'next/server';
import { Session } from 'types/api/auth.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { ORY_KRATOS_SESSION_COOKIE, USER_SESSION_COOKIE } from '@/utils/cookie';

export function setUserCookie(response: NextResponse, cookieId: string, value: string, maxAge: number): void {
  response.cookies.set(cookieId, value, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: maxAge,
    path: '/',
  });
}

export function getCookie(request: NextRequest, cookieName: string, parseJson = false): string | null {
  try {
    const cookieValue = request.cookies.get(cookieName)?.value;

    if (!cookieValue) return null;

    return parseJson ? JSON.parse(cookieValue) : cookieValue;
  } catch {
    return null;
  }
}

export function clearCookie(response: NextResponse, cookieId: string): void {
  response.cookies.delete(cookieId);
}

export async function getUserSession(
  request: NextRequest,
  checkCache = true,
): Promise<{ session: Session | null; cached: boolean }> {
  const cachedSession = getCookie(request, USER_SESSION_COOKIE, true) as Session | null;

  if (cachedSession && checkCache) {
    return { session: cachedSession, cached: true };
  }

  try {
    const oryKratosSession = getCookie(request, ORY_KRATOS_SESSION_COOKIE);

    if (!oryKratosSession) {
      return { session: null, cached: true };
    }

    const baseUrl = 'https://api-dev-aws-us.zamp.ai';

    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required');
    }
    const response = await fetch(`${baseUrl}/${API_ENDPOINTS.USER_WHOAMI_GET}`, {
      headers: {
        Cookie: `${ORY_KRATOS_SESSION_COOKIE}=${oryKratosSession}`,
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

  return orgs.length === 0 && !pathname.includes(ROUTES_PATH.INVITATIONS);
}

export async function validateSession(request: NextRequest): Promise<boolean> {
  try {
    const oryKratosSession = getCookie(request, ORY_KRATOS_SESSION_COOKIE);

    return !!oryKratosSession;
  } catch {
    return false;
  }
}
