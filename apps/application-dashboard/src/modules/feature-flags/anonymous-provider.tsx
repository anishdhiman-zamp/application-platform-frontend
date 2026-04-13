'use client';

import { ReactNode } from 'react';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from 'constants/featureFlags';
import { LDProvider } from 'launchdarkly-react-client-sdk';

interface AnonymousFeatureFlagsProviderProps {
  children: ReactNode;
}

const ANONYMOUS_LD_CONTEXT = { kind: 'user', anonymous: true } as const;

export const AnonymousFeatureFlagsProvider = ({ children }: AnonymousFeatureFlagsProviderProps) => {
  return (
    <LDProvider clientSideID={LAUNCH_DARKLY_CLIENT_SIDE_ID} context={ANONYMOUS_LD_CONTEXT}>
      {children}
    </LDProvider>
  );
};
