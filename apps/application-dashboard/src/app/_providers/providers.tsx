'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import ServiceWorkerProvider from '@/app/_providers/ServiceWorkerProvider';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <ServiceWorkerProvider>
        <Provider store={store}>
          <AuthGuard loginRoute='/login'>
            <FeatureFlagsProvider>
              <RouteGuard>{children}</RouteGuard>
            </FeatureFlagsProvider>
          </AuthGuard>
        </Provider>
      </ServiceWorkerProvider>
    </Suspense>
  );
};

export default Providers;
