import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import NotAuthorized from '@/components/NotAuthorized';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT } from '@/constants/common.constants';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useCookieInvalidation } from '@/hooks/useCookieInvalidation';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { RootState } from '@/store';
import { setDashboardLoader, setRoles, setUser, setWorkspace } from '@/store/slices/user';
import { UserRoleIdType } from '@/types/api/auth.types';
import { ORY_KRATOS_SESSION_COOKIE, setCookie, USER_SESSION_COOKIE } from '@/utils/cookie';
import { identifyPostHogUser } from '@/utils/postHog';

const UserDetailsProvider = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { evaluate, ldClient } = useFeatureFlags();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);

  const { data: session, isLoading, isSuccess, isError } = useWhoAmIQuery();

  useCookieInvalidation(USER_SESSION_COOKIE);

  const isAdminRoute = useMemo(() => pathname?.startsWith(ROUTES_PATH.ADMIN), [pathname]);

  useEffect(() => {
    if (session && isSuccess) {
      dispatch(setUser(session));
      const defaultWorkspace = session?.organization_id;
      const user_role = session?.orgs?.[0]?.resource_audience_policies?.[0]?.privilege;

      identifyPostHogUser(session.user_id, session?.user_email?.split('@')?.[1]);

      dispatch(setRoles([{ id: UserRoleIdType.USER, name: user_role }]));
      dispatch(setWorkspace(defaultWorkspace));
    }
  }, [session, isSuccess, dispatch]);

  useEffect(() => {
    if (isError) {
      setCookie(ORY_KRATOS_SESSION_COOKIE, '', -1);
      router.push(ROUTES_PATH.NO_ACCESS);
    }
  }, [isError, router]);

  useEffect(() => {
    if (isLoading || (session?.user_id && workspace === null)) {
      dispatch(setDashboardLoader(true));
    }
  }, [isLoading, session?.user_id, workspace, dispatch]);

  useEffect(() => {
    if (isAdminRoute && ldClient) {
      evaluate(FEATURE_FLAGS.ADMIN_PAGE).then((isAdminFeatureEnabled) => {
        if (!isAdminFeatureEnabled) {
          router.replace(ROUTES_PATH.NO_ACCESS);
        }
      });
    }
  }, [isAdminRoute, evaluate, ldClient, router]);

  if (
    session &&
    ENVIRONMENT === 'staging' &&
    ALLOWED_EMAIL_DOMAINS.every((eachDomain: string) => !session?.user_email?.endsWith(eachDomain))
  ) {
    return <NotAuthorized />;
  }

  return null;
};

export default UserDetailsProvider;
