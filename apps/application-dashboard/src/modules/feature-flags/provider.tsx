'use client';

import { ReactNode, useMemo } from 'react';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from 'constants/featureFlags';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { getUserSession } from '@/utils/cookie';

type Props = {
  children: ReactNode;
};

export const FeatureFlagsProvider = ({ children }: Props) => {
  const userSession = useMemo(() => getUserSession(), []);

  const context = useMemo(
    () => ({
      kind: 'user',
      key: userSession?.user_id ?? '',
      email: userSession?.user_email ?? '',
      organizationIds: userSession?.default_org_id ? [userSession.default_org_id] : [],
    }),
    [userSession?.user_id, userSession?.user_email, userSession?.default_org_id],
  );

  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_SIDE_ID} context={context}>
      {children}
    </LDProvider>
  );
};
