'use client';

import { useCallback, useMemo } from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOptionalSSEContext } from '@/app/_providers/sse-provider';
import { ENVIRONMENT, ENVIRONMENT_TYPES } from '@/constants/common.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import {
  clearCookie,
  LAST_VISITED_PRODUCT_MODE_COOKIE,
  PREV_ROUTE_COOKIE,
  setCookie,
  USER_SESSION_COOKIE,
} from '@/utils/cookie';
import { removeFromSessionStorage, SESSION_STORAGE_KEYS } from '@/utils/localstorage';
import { resetPostHog } from '@/utils/postHog';
import { getProductModeFromPath } from '@/utils/route.util';

export const useLogout = () => {
  const sseContext = useOptionalSSEContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: logoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut, { isLoading: isLoggingOut }] = useLazyLogoutQuery();
  const [whoAmI] = useLazyWhoAmIQuery();

  // Memoize the full path calculation
  const fullPath = useMemo(() => {
    if (searchParams && searchParams.toString()) {
      return `${pathname || ROUTES_PATH.HOME}?${searchParams.toString()}`;
    }

    return pathname || ROUTES_PATH.HOME;
  }, [pathname, searchParams]);

  const handleLogout = useCallback(async () => {
    // Disconnect SSE gracefully before logout to prevent readyState 2 errors
    sseContext?.disconnect();

    const currentMode = getProductModeFromPath(pathname || ROUTES_PATH.HOME);
    const domain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';

    setCookie(LAST_VISITED_PRODUCT_MODE_COOKIE, currentMode, undefined, domain);

    if (fullPath && fullPath !== ROUTES_PATH.HOME) {
      setCookie(PREV_ROUTE_COOKIE, encodeURIComponent(fullPath), undefined, domain);
    }

    // Clear USER_SESSION_COOKIE on client side
    clearCookie(USER_SESSION_COOKIE);
    removeFromSessionStorage(SESSION_STORAGE_KEYS.PACE_SIDEBAR_STATE);

    logOut(logoutFlow?.logout_url ?? '')
      .then(() => {
        whoAmI()
          .catch((e) => {
            console.error('WhoAmI failed', e);
          })
          .finally(() => {
            resetPostHog();
            router.push(ROUTES_PATH.LOGIN);
          });
      })
      .catch(() => {
        refetchLogoutFlow();
      });
  }, [logoutFlow, logOut, router, refetchLogoutFlow, fullPath, pathname, sseContext]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
