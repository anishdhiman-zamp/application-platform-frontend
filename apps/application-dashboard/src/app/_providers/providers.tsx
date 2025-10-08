'use client';

import React, { Suspense, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@zamp-platform/tanstack-table';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  useServiceWorker();

  return (
    <Suspense fallback={null}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
        </QueryClientProvider>
      </Provider>
    </Suspense>
  );
};

export default Providers;
