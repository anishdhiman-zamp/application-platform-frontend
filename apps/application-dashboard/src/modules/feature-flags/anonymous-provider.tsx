'use client';

import { ReactNode } from 'react';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from 'constants/featureFlags';
import { LDProvider } from 'launchdarkly-react-client-sdk';

interface AnonymousFeatureFlagsProviderProps {
  children: ReactNode;
}

export const AnonymousFeatureFlagsProvider = ({ children }: AnonymousFeatureFlagsProviderProps) => {
  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_SIDE_ID} context={{ kind: 'user', anonymous: true, key: '' }}>
      {children}
    </LDProvider>
  );
};
