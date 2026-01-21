'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Checks if the error is a network connectivity error (offline/disconnection).
 * These errors should not be sent to Sentry as they are expected user-side issues.
 */
export const isNetworkConnectivityError = (): boolean => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  return false;
};

export interface SSEErrorInfo {
  event: Event;
  isNetworkError: boolean;
  readyState: number;
  isFinal?: boolean;
}

export interface UseSSEOptions {
  url?: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (errorInfo: SSEErrorInfo) => void;
  onOpen?: () => void;
  onClose?: () => void;
  withCredentials?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  eventListeners?: {
    [eventType: string]: (event: MessageEvent) => void;
  };
  autoConnect?: boolean;
  errorReportDelayMs?: number;
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
  errorReportDelayMs = 0,
}: UseSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pendingErrorTimeoutRef = useRef<number | null>(null);

  const [_url, setUrl] = useState<string | null>(url || null);
  const [isActive, setIsActive] = useState(autoConnect);

  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[SSE] Connection closed');
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

    if (pendingErrorTimeoutRef.current) {
      clearTimeout(pendingErrorTimeoutRef.current);
      pendingErrorTimeoutRef.current = null;
    }

    setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));
  }, [eventListeners]);

  const initializeEventSource = useCallback(() => {
    if (!_url) {
      throw new Error('[SSE] URL is required');
    }
    if (!isActive) {
      throw new Error('[SSE] is not active');
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const eventSource = new EventSource(_url, { withCredentials });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Connection opened');

        if (pendingErrorTimeoutRef.current) {
          clearTimeout(pendingErrorTimeoutRef.current);
          pendingErrorTimeoutRef.current = null;
        }

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
        const isNetworkError = isNetworkConnectivityError();
        const readyState = eventSource.readyState;

        console.error('[SSE] Connection error', {
          readyState,
          isNetworkError,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
        });

        setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));

        const errorInfo: SSEErrorInfo = {
          event,
          isNetworkError,
          readyState,
        };

        // If errorReportDelayMs is set, delay the error report to allow for reconnection.
        // This helps avoid spurious error reports for transient network issues (VPN changes, etc.)
        if (errorReportDelayMs > 0) {
          // Clear any existing pending error timeout
          if (pendingErrorTimeoutRef.current) {
            clearTimeout(pendingErrorTimeoutRef.current);
          }

          pendingErrorTimeoutRef.current = window.setTimeout(() => {
            pendingErrorTimeoutRef.current = null;
            // Only report error if still not connected after the delay
            if (!eventSourceRef.current || eventSourceRef.current.readyState !== EventSource.OPEN) {
              onError?.(errorInfo);
            }
          }, errorReportDelayMs);
        } else {
          // No delay, report error immediately
          console.error('[SSE] error reported immediately', errorInfo);
          onError?.(errorInfo);
        }
      };

      eventSource.onmessage = (event) => {
        onMessage?.(event);
      };

      Object.entries(eventListeners).forEach(([type, handler]) => {
        eventSource.addEventListener(type, (event: MessageEvent) => {
          handler(event);
        });
      });
    } catch (err) {
      console.error('[SSE] failed to initialize EventSource', err);

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to initialize connection',
      }));

      scheduleReconnect();
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
    errorReportDelayMs,
  ]);

  const scheduleReconnect = useCallback(() => {
    if (!isActive) {
      console.info('[SSE] reconnect skipped, SSE not active');
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('[SSE] max reconnect attempts reached, giving up', {
        attempts: reconnectAttemptsRef.current,
        maxReconnectAttempts,
      });

      const errorInfo: SSEErrorInfo = {
        event: new Event('sse-final-error'),
        isNetworkError: isNetworkConnectivityError(),
        readyState: EventSource.CLOSED,
        isFinal: true,
      };

      onError?.(errorInfo);
      cleanup();
      return;
    }

    reconnectAttemptsRef.current += 1;

    console.warn('[SSE] scheduling reconnect', {
      attempt: reconnectAttemptsRef.current,
      maxReconnectAttempts,
      delayMs: reconnectIntervalMs,
    });

    setState((prev) => ({
      ...prev,
      reconnectAttempts: reconnectAttemptsRef.current,
    }));

    reconnectTimeoutRef.current = window.setTimeout(() => {
      initializeEventSource();
    }, reconnectIntervalMs);
  }, [cleanup, initializeEventSource, isActive, maxReconnectAttempts, onError, reconnectIntervalMs]);

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
