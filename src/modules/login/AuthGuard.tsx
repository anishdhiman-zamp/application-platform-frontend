import React, { useEffect } from 'react';
import { useWhoAmIQuery } from 'apis/auth';
import { ALLOWED_EMAIL_DOMAINS, ENVIRONMENT } from 'constants/common.constants';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { setUser, setWorkspace } from 'store/slices/user';
import NotAuthorized from 'components/NotAuthorized';

type Props = {
  loader: React.ReactNode;
  loginRoute: string;
  children: React.ReactNode;
};

export const AuthGuard: React.FC<Props> = (props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: session, isLoading, isError, isSuccess } = useWhoAmIQuery();
  const workspace = useAppSelector((state: RootState) => state.user.workspace);

  useEffect(() => {
    if (session && isSuccess) {
      dispatch(setUser(session));
      const defaultWorkspace = session?.organization_id;

      dispatch(setWorkspace(defaultWorkspace));
    }
  }, [session, isSuccess]);

  if (isError && router.pathname !== props.loginRoute) {
    let query = {};

    if (router.query.redirect_to) {
      query = { redirect_to: router.query.redirect_to };
    }
    router.push(props.loginRoute, {
      query,
    });

    return;
  }

  if (isSuccess && session?.user_id && router.pathname === props.loginRoute) {
    router.push((router.query.redirect_to as string) ?? '/');

    return;
  }

  if (isLoading || (session?.user_id && workspace === null)) {
    return props.loader;
  }

  if (!session) {
    if (router.pathname !== props.loginRoute) {
      return <div>Not logged in. Redirecting...</div>;
    } else {
      return props.children;
    }
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
