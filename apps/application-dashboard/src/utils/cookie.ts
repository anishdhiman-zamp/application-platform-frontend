import { ProductMode, type UserSessionCache } from '@/types/api/auth.types';

export const PREV_ROUTE_COOKIE = 'zamp_prev_route';
export const ORY_KRATOS_SESSION_COOKIE = 'ory_kratos_session';
export const USER_SESSION_COOKIE = 'zamp_user_session_v2';
export const THEME_COOKIE = 'zamp-theme';
export const ACTIVE_ORG_ID_COOKIE = 'zamp_active_org_id';
export const SESSION_CACHE_MAX_AGE = 60 * 5;
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SESSION_COOKIE_NAMES = {
  PRODUCTION: 'ory_kratos_session_us',
  US_PRODUCTION: 'ory_kratos_session_us',
  ME_PRODUCTION: 'ory_kratos_session_me',
  DEVELOPMENT: 'ory_kratos_session',
};

export const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE, domain?: string) => {
  if (typeof document !== 'undefined') {
    const domainPart = domain ? `; domain=${domain}` : '';

    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax${domainPart}`;
  }
};

export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie.split(';').find((c) => c.trim().startsWith(`${name}=`));

  return cookie ? cookie.split('=')[1] : null;
};

export const clearCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  }
};

export const getUserSession = (): UserSessionCache | null => {
  const cookieValue = getCookie(USER_SESSION_COOKIE);

  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as UserSessionCache;
  } catch {
    return null;
  }
};

export const isMacsProduct = (): boolean => {
  return getUserSession()?.product === ProductMode.MACS;
};
