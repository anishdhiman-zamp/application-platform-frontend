'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Checks if the error is a network connectivity error (offline/disconnection).
 * These errors should not be sent to Sentry as they are expected user-side issues.
 */
export const isNetworkConnectivityError = (): boolean => {
  // Check if browser is offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  return false;
};

export interface SSEErrorInfo {
  event: Event;
  isNetworkError: boolean;
  readyState: number;
}

export interface UseSSEOptions {
  url?: string;
  onMessage?: (event: MessageEvent) => void;
  /**
   * Called when an SSE error occurs.
   * @param errorInfo - Contains the error event and metadata about the error type.
   * Network connectivity errors (offline/disconnection) are flagged via `isNetworkError`.
   * You can use this flag to avoid sending network errors to Sentry.
   *
   * Note: If `errorReportDelayMs` is set, this callback is only called if the connection
   * does not recover within the delay period. This helps avoid spurious error reports
   * for transient network issues (VPN changes, route changes, etc.).
   */
  onError?: (errorInfo: SSEErrorInfo) => void;
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
  /**
   * Delay in milliseconds before reporting an error via onError callback.
   * If the connection recovers (onopen fires) within this period, the error is not reported.
   * This helps avoid spurious error reports for transient network issues like VPN changes.
   * Default: 0 (no delay, errors reported immediately)
   */
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
  const [_url, setUrl] = useState<string | null>(url || null);
  const idleIntervalRef = useRef<number | null>(null);
  const lastMessageTimestamp = useRef<number>(Date.now());
  const reconnectAttemptsRef = useRef(0);
  const [isActive, setIsActive] = useState(autoConnect);
  const pendingErrorTimeoutRef = useRef<number | null>(null);

  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('SSE Connection closed');
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

    // Clear any pending error timeout to prevent stale error reports
    if (pendingErrorTimeoutRef.current) {
      clearTimeout(pendingErrorTimeoutRef.current);
      pendingErrorTimeoutRef.current = null;
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
        console.log('SSE connection opened');

        // Clear any pending error timeout - connection recovered successfully
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

        console.error('SSE connection error', {
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
          onError?.(errorInfo);
        }
      };

      eventSource.onmessage = (event) => {
        lastMessageTimestamp.current = Date.now();
        onMessage?.(event);
      };

      Object.entries(eventListeners).forEach(([type, handler]) => {
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
          `Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${reconnectIntervalMs}ms`,
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
    errorReportDelayMs,
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
