'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  useServiceWorker();

  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <AuthGuard loginRoute='/login'>
          <FeatureFlagsProvider>
            <RouteGuard>{children}</RouteGuard>
          </FeatureFlagsProvider>
        </AuthGuard>
      </Provider>
    </Suspense>
  );
};

export default Providers;
