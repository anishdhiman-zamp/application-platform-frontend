'use client';

import React, { Suspense, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@zamp-platform/tanstack-table';
import { EventBus } from '@zamp-platform/utils';
import { RegionProvider } from 'app/_providers/region-provider';
import { SSEProvider } from 'app/_providers/sse-provider';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  useServiceWorker();
  const sseEventBus = new EventBus();

  return (
    <Suspense fallback={null}>
      <RegionProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthGuard loginRoute='/login'>
              <FeatureFlagsProvider>
                <SSEProvider sseEventBus={sseEventBus}>
                  <RouteGuard>{children}</RouteGuard>
                </SSEProvider>
              </FeatureFlagsProvider>
            </AuthGuard>
          </QueryClientProvider>
        </Provider>
      </RegionProvider>
    </Suspense>
  );
};

export default Providers;
