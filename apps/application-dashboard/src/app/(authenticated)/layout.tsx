'use client';

import { FC, ReactNode, Suspense } from 'react';
import { Provider } from 'react-redux';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import DashboardContent from 'app/DashboardContent';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <AgChartInit />
        <PostHogProviderWrapper>
          <AuthGuard loginRoute='/login'>
            <FeatureFlagsProvider>
              <RouteGuard>
                <DashboardContent>{children}</DashboardContent>
              </RouteGuard>
            </FeatureFlagsProvider>
          </AuthGuard>
        </PostHogProviderWrapper>
      </Provider>
    </Suspense>
  );
};

export default AuthenticatedLayout;
