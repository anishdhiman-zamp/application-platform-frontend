'use client';

import { FC, ReactNode, useMemo } from 'react';
import { EventBus } from '@zamp-platform/utils';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import Providers from 'app/_providers/providers';
import { SSEProvider } from 'app/_providers/sse-provider';
import UserDetailsProvider from 'app/_providers/user-details-provider';
import LayoutWrapper from '@/components/layouts/LayoutWrapper';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  const sseEventBus = useMemo(() => new EventBus(), []);

  return (
    <Providers>
      <AgChartInit />
      <UserDetailsProvider />
      <PostHogProviderWrapper>
        <LayoutWrapper>
          <SSEProvider sseEventBus={sseEventBus}>{children}</SSEProvider>
        </LayoutWrapper>
      </PostHogProviderWrapper>
    </Providers>
  );
};

export default AuthenticatedLayout;
