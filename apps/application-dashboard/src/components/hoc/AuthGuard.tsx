'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useWhoAmIQuery } from 'apis/auth';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT } from 'constants/common.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import OrgMembershipPending from 'modules/login/OrgMembershipPending';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getFromSessionStorage, SESSION_STORAGE_KEYS } from '@/utils/sessionstorage';
import NotAuthorized from 'components/NotAuthorized';

type Props = {
  loginRoute: string;
  children: ReactNode;
};

export const AuthGuard: FC<Props> = (props) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const { data: session, isSuccess } = useWhoAmIQuery();

  useEffect(() => {
    if (isSuccess && session?.user_id && pathname === props.loginRoute) {
      const preLogoutPath = getFromSessionStorage(SESSION_STORAGE_KEYS.PATHNAME_PRE_LOGOUT);

      if (preLogoutPath) {
        router.push(preLogoutPath);
      } else {
        router.push(ROUTES_PATH.HOME);
      }
    }
  }, [isSuccess, session?.user_id, pathname, props.loginRoute, router, searchParams]);

  if (session?.orgs?.length === 0 && !pathname.includes(ROUTES_PATH.INVITATIONS)) {
    return <OrgMembershipPending />;
  }

  if (
    session &&
    ENVIRONMENT === 'staging' &&
    ALLOWED_EMAIL_DOMAINS.every((eachDomain: string) => !session?.user_email?.endsWith(eachDomain))
  ) {
    return <NotAuthorized />;
  }

  return props.children;
};
