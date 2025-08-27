'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { RegionProvider } from 'app/_providers/region-provider';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { SSEProvider } from '@/contexts/SSEContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  useServiceWorker();

  return (
    <Suspense fallback={null}>
      <RegionProvider>
        <Provider store={store}>
          <AuthGuard loginRoute='/login'>
            <FeatureFlagsProvider>
              <SSEProvider>
                <RouteGuard>{children}</RouteGuard>
              </SSEProvider>
            </FeatureFlagsProvider>
          </AuthGuard>
        </Provider>
      </RegionProvider>
    </Suspense>
  );
};

export default Providers;
