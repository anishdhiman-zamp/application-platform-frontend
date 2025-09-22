'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { EventBus } from '@zamp-platform/utils';
import { SSEProvider } from 'app/_providers/sse-provider';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  useServiceWorker();
  const sseEventBus = new EventBus();

  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <AuthGuard loginRoute='/login'>
          <FeatureFlagsProvider>
            <SSEProvider sseEventBus={sseEventBus}>
              <RouteGuard>{children}</RouteGuard>
            </SSEProvider>
          </FeatureFlagsProvider>
        </AuthGuard>
      </Provider>
    </Suspense>
  );
};

export default Providers;
