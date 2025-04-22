import { useCallback } from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useRouter } from 'next/router';
import { resetPostHog } from 'utils/postHog';
import { SESSION_STORAGE_KEYS, setToSessionStorage } from '@/utils/sessionstorage';

export const useLogout = () => {
  const router = useRouter();
  const { data: logoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut] = useLazyLogoutQuery();
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
            setToSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT, router.pathname);
            router.push(ROUTES_PATH.LOGIN);
          });
      })
      .catch(() => {
        refetchLogoutFlow();
      });
  }, [logoutFlow, logOut, router, refetchLogoutFlow]);

  return {
    logout: handleLogout,
  };
};
