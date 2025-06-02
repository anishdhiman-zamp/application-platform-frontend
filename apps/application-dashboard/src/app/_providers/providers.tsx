'use client';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import AgChartInit from 'app/_providers/ag-chart';
import PostHogProviderWrapper from 'app/_providers/posthog-provider';
import { FeatureFlagsProvider } from 'modules/feature-flags/provider';
import { store } from 'store';
import { AuthGuard } from 'components/hoc/AuthGuard';
import { RouteGuard } from 'components/hoc/RouteGuard';
import NetworkStatus from 'components/NetWorkStatus';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <SpeedInsights />
        <AgChartInit />
        <PostHogProviderWrapper>
          <AuthGuard loginRoute='/login'>
            <FeatureFlagsProvider>
              <RouteGuard>
                <div className={'h-screen light-mode'}>
                  <NetworkStatus />
                  {children}
                </div>
              </RouteGuard>
              <Toaster />
            </FeatureFlagsProvider>
          </AuthGuard>
        </PostHogProviderWrapper>
      </Provider>
    </Suspense>
  );
}
