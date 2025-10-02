'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useWhoAmIQuery } from 'apis/auth';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT } from 'constants/common.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import OrgMembershipPending from 'modules/login/OrgMembershipPending';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RootState } from 'store';
import { setDashboardLoader, setRoles, setUser, setWorkspace } from 'store/slices/user';
import { UserRoleIdType } from 'types/api/auth.types';
import { identifyPostHogUser } from 'utils/postHog';
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
  const dispatch = useAppDispatch();

  const { data: session, isLoading, isError, isSuccess } = useWhoAmIQuery();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);

  useEffect(() => {
    if (session && isSuccess) {
      dispatch(setUser(session));
      const defaultWorkspace = session?.organization_id;
      const user_role = session?.orgs[0]?.resource_audience_policies[0]?.privilege;

      dispatch(setRoles([{ id: UserRoleIdType.USER, name: user_role }]));
      identifyPostHogUser(session.user_id, session?.user_email?.split('@')?.[1]);

      dispatch(setWorkspace(defaultWorkspace));
    }
  }, [session, isSuccess, dispatch, router]);

  useEffect(() => {
    if (isError && pathname !== props.loginRoute) {
      router.push(`${props.loginRoute}`);
    }
  }, [isError, pathname, props.loginRoute, router, searchParams]);

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

  useEffect(() => {
    if (isLoading || (session?.user_id && workspace === null)) {
      dispatch(setDashboardLoader(true));
    }
  }, [isLoading, session?.user_id, workspace, dispatch]);

  if (isLoading || (session?.user_id && workspace === null)) {
    return null;
  }

  if (!session) {
    if (pathname !== props.loginRoute) {
      return null;
    } else {
      return props.children;
    }
  }

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
