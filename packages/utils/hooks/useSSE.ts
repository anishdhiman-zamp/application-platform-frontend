import { captureException } from '@sentry/browser';
import { useCallback, useEffect, useRef } from 'react';

interface UseSSEOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  withCredentials?: boolean;
  reconnectIntervalMs?: number;
  eventListeners?: {
    [eventType: string]: (event: MessageEvent) => void;
  };
  idleTimeoutMs?: number;
}

export const useSSE = ({
  url,
  onMessage,
  onError,
  onOpen,
  withCredentials = true,
  reconnectIntervalMs = 2000,
  eventListeners = {},
  idleTimeoutMs = 60000,
}: UseSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const idleIntervalRef = useRef<number | null>(null);
  const lastMessageTimestamp = useRef<number>(Date.now());

  const cleanup = () => {
    if (eventSourceRef.current) {
      Object.entries(eventListeners).forEach(([type, handler]) => {
        eventSourceRef.current?.removeEventListener(type, handler);
      });

      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
  };

  const initializeEventSource = useCallback(() => {
    try {
      const eventSource = new EventSource(url, { withCredentials });
      eventSourceRef.current = eventSource;

      if (onMessage) {
        eventSource.onmessage = (event) => {
          lastMessageTimestamp.current = Date.now();
          onMessage(event);
        };
      }

      if (onError) {
        eventSource.onerror = (event) => {
          onError(event);
        };
      }

      if (onOpen) {
        eventSource.onopen = onOpen;
      }

      Object.entries(eventListeners).forEach(([type, handler]) => {
        eventSource.addEventListener(type, (event: MessageEvent) => {
          lastMessageTimestamp.current = Date.now();
          handler(event);
        });
      });

      if (!idleIntervalRef.current) {
        idleIntervalRef.current = window.setInterval(() => {
          const now = Date.now();
          const idleTime = now - lastMessageTimestamp.current;

          if (idleTime > idleTimeoutMs) {
            cleanup();
            initializeEventSource();
          }
        }, 10000);
      }
    } catch (err) {
      console.log('err', err);
      captureException(err);
      cleanup();
      if (reconnectIntervalMs > 0) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          initializeEventSource();
        }, reconnectIntervalMs);
      }
    }
  }, [url, withCredentials, onMessage, onError, onOpen, eventListeners, reconnectIntervalMs, idleTimeoutMs]);

  useEffect(() => {
    initializeEventSource();

    return () => {
      cleanup();
    };
  }, [initializeEventSource]);

  return {
    close: cleanup,
  };
};
