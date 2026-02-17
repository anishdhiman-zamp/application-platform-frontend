'use client';

import { FC, ReactNode, useMemo } from 'react';
import { BattalionProvider } from '@zamp-platform/battalion';
import { EventBus } from '@zamp-platform/utils';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import Providers from 'app/_providers/providers';
import { SSEProvider } from 'app/_providers/sse-provider';
import UserDetailsProvider from 'app/_providers/user-details-provider';
import { ProductionErrorBoundary } from '@/pages/ErrorBoundary';

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
        <SSEProvider sseEventBus={sseEventBus}>
          <BattalionProvider eventBus={sseEventBus}>
            <ProductionErrorBoundary>{children}</ProductionErrorBoundary>
          </BattalionProvider>
        </SSEProvider>
      </PostHogProviderWrapper>
    </Providers>
  );
};

export default LayoutProviders;
