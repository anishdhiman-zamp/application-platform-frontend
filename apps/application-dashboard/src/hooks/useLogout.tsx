'use client';

import { useCallback, useMemo } from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOptionalSSEContext } from '@/app/_providers/sse-provider';
import { ENVIRONMENT, ENVIRONMENT_TYPES } from '@/constants/common.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { clearCookie, PREV_ROUTE_COOKIE, setCookie, USER_SESSION_COOKIE } from '@/utils/cookie';
import { resetPostHog } from '@/utils/postHog';

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
      return `${pathname || '/'}?${searchParams.toString()}`;
    }

    return pathname || '/';
  }, [pathname, searchParams]);

  const handleLogout = useCallback(async () => {
    // Disconnect SSE gracefully before logout to prevent readyState 2 errors
    sseContext?.disconnect();

    if (fullPath && fullPath !== '/') {
      const domain = ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION ? '.zamp.ai' : '.zamp.dev';

      setCookie(PREV_ROUTE_COOKIE, encodeURIComponent(fullPath), undefined, domain);
    }

    // Clear USER_SESSION_COOKIE on client side
    clearCookie(USER_SESSION_COOKIE);

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
  }, [logoutFlow, logOut, router, refetchLogoutFlow, fullPath, sseContext]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
