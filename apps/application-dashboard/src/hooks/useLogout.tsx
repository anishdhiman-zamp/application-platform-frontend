'use client';

import { useCallback } from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { usePathname, useRouter } from 'next/navigation';
import { resetPostHog } from 'utils/postHog';
import { SESSION_STORAGE_KEYS, setToSessionStorage } from '@/utils/sessionstorage';

export const useLogout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: logoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut, { isLoading: isLoggingOut }] = useLazyLogoutQuery();
  const [whoAmI] = useLazyWhoAmIQuery();

  const handleLogout = useCallback(async () => {
    logOut(logoutFlow?.logout_url ?? '')
      .then(() => {
        whoAmI()
          .catch((e) => {
            console.error('WhoAmI failed', e);
          })
          .finally(() => {
            resetPostHog();
            setToSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT, pathname || '/');
            router.push(ROUTES_PATH.LOGIN);
          });
      })
      .catch(() => {
        refetchLogoutFlow();
      });
  }, [logoutFlow, logOut, router, refetchLogoutFlow, pathname]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
