import { useEffect } from 'react';
import { useWhoAmIQuery } from '@/apis/auth';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { RootState } from '@/store';
import { setDashboardLoader, setRoles, setUser, setWorkspace } from '@/store/slices/user';
import { UserRoleIdType } from '@/types/api/auth.types';
import { identifyPostHogUser } from '@/utils/postHog';

const UserDetailsProvider = () => {
  const dispatch = useAppDispatch();

  const { data: session, isLoading, isSuccess } = useWhoAmIQuery();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);

  useEffect(() => {
    if (session && isSuccess) {
      dispatch(setUser(session));
      const defaultWorkspace = session?.organization_id;
      const user_role = session?.orgs[0]?.resource_audience_policies[0]?.privilege;

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

  return null;
};

export default UserDetailsProvider;
