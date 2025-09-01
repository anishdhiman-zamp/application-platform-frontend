'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSSEOptions {
  url?: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  withCredentials?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  eventListeners?: {
    [eventType: string]: (event: MessageEvent) => void;
  };
  idleTimeoutMs?: number;
  autoConnect?: boolean;
}

export interface SSEConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useSSE = ({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  withCredentials = true,
  reconnectIntervalMs = 2000,
  maxReconnectAttempts = 5,
  eventListeners = {},
  autoConnect = true,
}: UseSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [_url, setUrl] = useState<string | null>(url || null);
  const idleIntervalRef = useRef<number | null>(null);
  const lastMessageTimestamp = useRef<number>(Date.now());
  const reconnectAttemptsRef = useRef(0);
  const [isActive, setIsActive] = useState(autoConnect);

  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const cleanup = useCallback(() => {
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

    setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));
  }, [eventListeners]);

  const initializeEventSource = useCallback(() => {
    if (!_url) {
      throw new Error('URL is required');
    }
    if (!isActive) {
      throw new Error('SSE is not active');
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const eventSource = new EventSource(_url, { withCredentials });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useSSE] SSE connection opened', { url: _url });
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      eventSource.onerror = (event) => {
        console.error('[useSSE] SSE connection error', { url: _url, event });
        setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));
        onError?.(event);
      };

      eventSource.onmessage = (event) => {
        lastMessageTimestamp.current = Date.now();
        onMessage?.(event);
      };

      Object.entries(eventListeners).forEach(([type, handler]) => {
        console.log(`[useSSE] Registering event listener for type "${type}"`);
        eventSource.addEventListener(type, (event: MessageEvent) => {
          lastMessageTimestamp.current = Date.now();
          handler(event);
        });
      });
    } catch (err) {
      console.error('Failed to initialize EventSource connection:', { url: _url, error: err });
      setState((prev) => ({ ...prev, error: 'Failed to initialize connection', isConnecting: false }));

      if (reconnectAttemptsRef.current < maxReconnectAttempts && isActive) {
        reconnectAttemptsRef.current += 1;
        setState((prev) => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));

        console.log(
          `[useSSE] Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${reconnectIntervalMs}ms`,
          { url: _url },
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          initializeEventSource();
        }, reconnectIntervalMs);
      }
    }
  }, [
    _url,
    withCredentials,
    onMessage,
    onError,
    onOpen,
    eventListeners,
    reconnectIntervalMs,
    maxReconnectAttempts,
    isActive,
  ]);

  const connect = useCallback(
    (url?: string) => {
      if (url) {
        setUrl(url);
      }

      if (!isActive) {
        setIsActive(true);
        reconnectAttemptsRef.current = 0;
        setState((prev) => ({ ...prev, error: null, reconnectAttempts: 0 }));
      }
    },
    [isActive],
  );

  const disconnect = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      cleanup();
      onClose?.();
    }
  }, [isActive, cleanup, onClose]);

  useEffect(() => {
    if (isActive) {
      initializeEventSource();
    }

    return () => {
      cleanup();
    };
  }, [isActive]);

  return {
    connect,
    disconnect,
    close: cleanup,
    state,
    eventSource: eventSourceRef.current,
  };
};
