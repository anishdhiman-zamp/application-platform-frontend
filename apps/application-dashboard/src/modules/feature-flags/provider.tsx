'use client';

import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { ENVIRONMENT } from 'constants/common.constants';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from 'constants/featureFlags';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { RootState } from 'store';

type Props = {
  children: ReactNode;
};

export const FeatureFlagsProvider = ({ children }: Props) => {
  const user = useSelector((state: RootState) => state.user.user);

  if (ENVIRONMENT === 'local') return children;

  // Always render LDProvider, but conditionally provide user context
  const context = user
    ? {
        kind: 'user',
        key: user.user_id || '',
        email: user.user_email || '',
        organizationIds: user.orgs?.map((org) => org.organization_id) || [],
      }
    : {
        kind: 'user',
        key: 'anonymous',
      };

  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_SIDE_ID} context={context}>
      {children}
    </LDProvider>
  );
};
