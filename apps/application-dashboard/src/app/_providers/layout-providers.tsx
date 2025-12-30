'use client';

import { FC, ReactNode, useMemo } from 'react';
import { EventBus } from '@zamp-platform/utils';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import Providers from 'app/_providers/providers';
import { SSEProvider } from 'app/_providers/sse-provider';
import UserDetailsProvider from 'app/_providers/user-details-provider';

interface LayoutProvidersProps {
  children: ReactNode;
}

const LayoutProviders: FC<LayoutProvidersProps> = ({ children }) => {
  const sseEventBus = useMemo(() => new EventBus(), []);

  return (
    <Providers>
      <AgChartInit />
      <UserDetailsProvider />
      <PostHogProviderWrapper>
        <SSEProvider sseEventBus={sseEventBus}>{children}</SSEProvider>
      </PostHogProviderWrapper>
    </Providers>
  );
};

export default LayoutProviders;
