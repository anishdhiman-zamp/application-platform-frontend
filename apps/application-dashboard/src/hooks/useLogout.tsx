'use client';

import { useCallback, useState } from 'react';
import { ENVIRONMENT, getApiDomain } from '@zamp-platform/api';
import { useLazyInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { useAppSelector } from 'hooks/toolkit';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { RootState } from '@/store';
import { resetPostHog } from '@/utils/postHog';
import { SESSION_STORAGE_KEYS, setToSessionStorage } from '@/utils/sessionstorage';

export const useLogout = () => {
  const { user } = useAppSelector((state: RootState) => state);

  const router = useRouter();
  const pathname = usePathname();
  const [initiateLogoutFlow] = useLazyInitiateLogoutFlowQuery();
  const [logOut] = useLazyLogoutQuery();
  const [whoAmI] = useLazyWhoAmIQuery();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    const logoutPromises = user?.organizations?.map((org) => {
      const domain = getApiDomain(ENVIRONMENT, org.region);

      return initiateLogoutFlow(domain)
        .unwrap()
        .then((res) => {
          return logOut(res.logout_url ?? '');
        });
    });

    Promise.all(logoutPromises ?? []).then(() => {
      whoAmI().then(() => {
        resetPostHog();
        setToSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT, pathname || '/');
        router.push(ROUTES_PATH.LOGIN);
        setIsLoggingOut(false);
      });
    });
  }, [initiateLogoutFlow, logOut, router, pathname, user?.organizations]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
