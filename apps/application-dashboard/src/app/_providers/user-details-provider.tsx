import { useEffect } from 'react';
import { useWhoAmIQuery } from '@/apis/auth';
import NotAuthorized from '@/components/NotAuthorized';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT } from '@/constants/common.constants';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useCookieInvalidation } from '@/hooks/useCookieInvalidation';
import { RootState } from '@/store';
import { setDashboardLoader, setRoles, setUser, setWorkspace } from '@/store/slices/user';
import { UserRoleIdType } from '@/types/api/auth.types';
import { USER_SESSION_COOKIE } from '@/utils/cookie';
import { identifyPostHogUser } from '@/utils/postHog';

const UserDetailsProvider = () => {
  const dispatch = useAppDispatch();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);

  const {
    data: session,
    isLoading,
    isSuccess,
  } = useWhoAmIQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useCookieInvalidation(USER_SESSION_COOKIE);

  useEffect(() => {
    if (session && isSuccess) {
      dispatch(setUser(session));
      const defaultWorkspace = session?.organization_id;
      const user_role = session?.orgs?.[0]?.resource_audience_policies?.[0]?.privilege;

      const org = session?.orgs?.[0];

      identifyPostHogUser(
        session.user_id,
        session?.user_email?.split('@')?.[1] || '', // Merchant (email domain only, no PII)
        org?.organization_id,
        org?.name,
      );

      dispatch(setRoles([{ id: UserRoleIdType.USER, name: user_role }]));
      dispatch(setWorkspace(defaultWorkspace));
    }
  }, [session, isSuccess, dispatch]);

  useEffect(() => {
    if (isLoading || (session?.user_id && workspace === null)) {
      dispatch(setDashboardLoader(true));
    }
  }, [isLoading, session?.user_id, workspace, dispatch]);

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
