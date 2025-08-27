'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { API_DOMAIN } from '@zamp-platform/api';
import { eventBus, useSSE } from '@zamp-platform/utils';
import { RegionProvider } from 'app/_providers/region-provider';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { AuthGuard } from '@/components/hoc/AuthGuard';
import { RouteGuard } from '@/components/hoc/RouteGuard';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { store } from '@/store';

const Providers = ({ children }: { children: React.ReactNode }) => {
  useServiceWorker();
  useSSE({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    url: `${API_DOMAIN}/${API_ENDPOINTS.UNFIED_SSE}`,
    eventListeners: {
      update: (event) => {
        const data = JSON.parse(event.data);

        eventBus.publish(data.type, event);
      },
      message: (event) => {
        const data = JSON.parse(event.data);

        eventBus.publish(data.type, event);
      },
    },
  });

  return (
    <Suspense fallback={null}>
      <RegionProvider>
        <Provider store={store}>
          <AuthGuard loginRoute='/login'>
            <FeatureFlagsProvider>
              <RouteGuard>{children}</RouteGuard>
            </FeatureFlagsProvider>
          </AuthGuard>
        </Provider>
      </RegionProvider>
    </Suspense>
  );
};

export default Providers;
