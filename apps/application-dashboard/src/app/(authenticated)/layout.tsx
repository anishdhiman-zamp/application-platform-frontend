'use client';

import { FC, ReactNode } from 'react';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import Providers from 'app/_providers/providers';
import DashboardContent from 'app/DashboardContent';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <Providers>
      <AgChartInit />
      <PostHogProviderWrapper>
        <DashboardContent>{children}</DashboardContent>
      </PostHogProviderWrapper>
    </Providers>
  );
};

export default AuthenticatedLayout;
