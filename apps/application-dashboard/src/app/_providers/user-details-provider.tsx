import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import NotAuthorized from '@/components/NotAuthorized';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT, ENVIRONMENT_TYPES } from '@/constants/common.constants';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import ScreenSupport from '@/modules/cards/ScreenSupport';
import OrgMembershipPending from '@/modules/login/OrgMembershipPending';
import { RootState } from '@/store';
import { setDashboardLoader, setRoles, setUser, setWorkspace } from '@/store/slices/user';
import { UserRoleIdType } from '@/types/api/auth.types';
import { checkScreenBreakpoint } from '@/utils/common';
import { identifyPostHogUser } from '@/utils/postHog';

const UserDetailsProvider = () => {
  const dispatch = useAppDispatch();

  const { data: session, isLoading, isSuccess } = useWhoAmIQuery();
  const pathname = usePathname();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);
  const router = useRouter();
  const { evaluate, ldClient } = useFeatureFlags();
  const { width, height } = useWindowDimensions();
  const breakpoint = checkScreenBreakpoint(width, height);

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

  if (breakpoint && ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION) return <ScreenSupport />;

  if (session?.orgs?.length === 0 && !pathname?.includes(ROUTES_PATH.INVITATIONS)) {
    return <OrgMembershipPending />;
  }

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
