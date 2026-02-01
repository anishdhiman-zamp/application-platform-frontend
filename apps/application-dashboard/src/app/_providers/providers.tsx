'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { API_DOMAIN } from '@zamp-platform/api';
import { TransactionProvider } from '@zamp-platform/battalion';
import { QueryClient, QueryClientProvider } from '@zamp-platform/tanstack-table';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { useNavigationListener } from '@/hooks/useNavigationListener';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  useServiceWorker();
  useNavigationListener();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagsProvider>
          <TransactionProvider
            config={{
              baseUrl: API_DOMAIN,
              maxRetries: 3,
              retryDelay: 1000,
              getOrganizationId: () => getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
            }}
          >
            {children}
          </TransactionProvider>
        </FeatureFlagsProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default Providers;
