'use client';

import { FC, ReactNode } from 'react';
import { EventBus } from '@zamp-platform/utils';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import Providers from 'app/_providers/providers';
import { SSEProvider } from 'app/_providers/sse-provider';
import DashboardContent from 'app/DashboardContent';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  const sseEventBus = new EventBus();

  return (
    <Providers>
      <AgChartInit />
      <PostHogProviderWrapper>
        <DashboardContent>
          <SSEProvider sseEventBus={sseEventBus}>{children}</SSEProvider>
        </DashboardContent>
      </PostHogProviderWrapper>
    </Providers>
  );
};

export default AuthenticatedLayout;
