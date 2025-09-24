'use client';

import React, { Suspense, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@zamp-platform/tanstack-table';
import { EventBus } from '@zamp-platform/utils';
import { RegionProvider } from 'app/_providers/region-provider';
import { SSEProvider } from 'app/_providers/sse-provider';
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
            <FeatureFlagsProvider>
              <SSEProvider sseEventBus={sseEventBus}>{children}</SSEProvider>
            </FeatureFlagsProvider>
          </QueryClientProvider>
        </Provider>
      </RegionProvider>
    </Suspense>
  );
};

export default Providers;
