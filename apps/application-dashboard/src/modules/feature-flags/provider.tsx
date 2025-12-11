'use client';

import { ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from 'constants/featureFlags';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { RootState } from 'store';

type Props = {
  children: ReactNode;
};

export const FeatureFlagsProvider = ({ children }: Props) => {
  const user = useSelector((state: RootState) => state.user.user);

  // Always use the same context structure to prevent children remounting
  // When user is not loaded, use anonymous context
  const context = useMemo(
    () => ({
      kind: 'user',
      key: user?.user_id || 'anonymous',
      email: user?.user_email || '',
      organizationIds: user?.orgs?.map((org) => org.organization_id) || [],
    }),
    [user?.user_id, user?.user_email, user?.orgs],
  );

  // Always render LDProvider to maintain consistent tree structure
  // This prevents children from remounting when user state changes
  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_SIDE_ID} context={context}>
      {children}
    </LDProvider>
  );
};
