'use client';

import { useCallback, useMemo } from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resetPostHog } from 'utils/postHog';
import { SESSION_STORAGE_KEYS, setToSessionStorage } from '@/utils/sessionstorage';

export const useLogout = () => {
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
    logOut(logoutFlow?.logout_url ?? '')
      .then(() => {
        whoAmI()
          .catch((e) => {
            console.error('WhoAmI failed', e);
          })
          .finally(() => {
            resetPostHog();
            setToSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT, fullPath);
            router.push(ROUTES_PATH.LOGIN);
          });
      })
      .catch(() => {
        refetchLogoutFlow();
      });
  }, [logoutFlow, logOut, router, refetchLogoutFlow, fullPath]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
