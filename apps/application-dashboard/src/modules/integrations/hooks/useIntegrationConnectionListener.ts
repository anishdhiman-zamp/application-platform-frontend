'use client';

import { useEffect, useState } from 'react';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils';
import { useEventBus } from '@/app/_providers/sse-provider';
import type { IntegrationConnection } from '@/types/api/integrations';
import type { MapAny } from '@/types/commonTypes';

interface UseIntegrationConnectionListenerArgsType {
  integrationName: string | undefined;
  initiallyConnected?: boolean;
}

interface UseIntegrationConnectionListenerReturnType {
  isConnected: boolean;
  latestConnection: IntegrationConnection | null;
}

/**
 * Listens to the unified SSE bus for `CONNECTION_UPDATE` events scoped to a
 * specific integration. When the backend reports a successful OAuth connection
 * for this integration, `isConnected` flips to `true` so the caller can swap
 * its UI (e.g. replace the Connect button with a "Connected" pill) without
 * refetching catalog data.
 */
export const useIntegrationConnectionListener = ({
  integrationName,
  initiallyConnected = false,
}: UseIntegrationConnectionListenerArgsType): UseIntegrationConnectionListenerReturnType => {
  const { sseEventBus } = useEventBus();
  const [isConnected, setIsConnected] = useState(initiallyConnected);
  const [latestConnection, setLatestConnection] = useState<IntegrationConnection | null>(null);

  useEffect(() => {
    if (!integrationName) return;

    const sub = sseEventBus.subscribe(EVENT_TYPE.CONNECTION_UPDATE, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const connection = payload?.connection as IntegrationConnection | undefined;

      if (!connection?.integration_name) return;
      if (connection.integration_name !== integrationName) return;
      setIsConnected(true);
      setLatestConnection(connection);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sseEventBus, integrationName]);

  return { isConnected, latestConnection };
};
