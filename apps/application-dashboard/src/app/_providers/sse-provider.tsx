'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import { captureException } from '@sentry/nextjs';
import { API_DOMAIN } from '@zamp-platform/api';
import { EventBus, SSEConnectionState, useSSE } from '@zamp-platform/utils';
import type { EventBusInterface } from '@zamp-platform/utils/event-bus/event-bus.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';

interface SSEContextType {
  state: SSEConnectionState;
  connect: (url?: string) => void;
  disconnect: () => void;
  close: () => void;
  eventSource: EventSource | null;
  sseEventBus: EventBusInterface;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const useSSEContext = () => {
  const context = useContext(SSEContext);

  if (context === undefined) {
    throw new Error('useSSEContext must be used within an SSEProvider');
  }

  return context;
};

interface SSEProviderProps {
  children: ReactNode;
  sseEventBus: EventBusInterface;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children, sseEventBus = new EventBus() }) => {
  const handleSSEEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data?.type) {
        sseEventBus.publish(data.type, data);
      } else {
        captureException(new Error('SSE event received without required type field'));
      }
    } catch (error) {
      captureException(error);
    }
  };

  const sseHook = useSSE({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    url: `${API_DOMAIN}/${API_ENDPOINTS.UNIFIED_SSE}`,
    eventListeners: {
      update: handleSSEEvent,
      message: handleSSEEvent,
    },
  });

  const value: SSEContextType = {
    state: sseHook.state,
    connect: sseHook.connect,
    disconnect: sseHook.disconnect,
    close: sseHook.close,
    eventSource: sseHook.eventSource,
    sseEventBus,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};

export const useEventBus = (): SSEContextType => {
  const context = useContext(SSEContext);

  if (!context) {
    throw new Error('useEventBus must be used within an SSEProvider');
  }

  return context;
};
