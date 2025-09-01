'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import { captureException } from '@sentry/nextjs';
import { API_DOMAIN } from '@zamp-platform/api';
import { eventBus, SSEConnectionState, useSSE } from '@zamp-platform/utils';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';

interface SSEContextType {
  state: SSEConnectionState;
  connect: (url?: string) => void;
  disconnect: () => void;
  close: () => void;
  eventSource: EventSource | null;
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
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const handleSSEEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data?.type) {
        eventBus.publish(data.type, event);
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
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};
