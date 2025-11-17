'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient, LiveClient, type LiveSchema, LiveTranscriptionEvents, SOCKET_STATES } from '@deepgram/sdk';
import { captureException } from '@sentry/browser';
import { useDeepgramToken } from 'hooks/useDeepgramToken';

interface UseDeepgramConnectionReturn {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  isLoadingToken: boolean;
  tokenError: boolean;
}

/**
 * Hook to manage Deepgram WebSocket connection lifecycle
 * Uses useDeepgramToken for token management
 */
export const useDeepgramConnection = (): UseDeepgramConnectionReturn => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);

  const { getValidToken, isLoadingToken, tokenError } = useDeepgramToken();

  // Establish WebSocket connection to Deepgram with provided options
  const connectToDeepgram = useCallback(
    async (options: LiveSchema, endpoint?: string) => {
      try {
        const token = await getValidToken();

        // Close existing connection before creating new one
        if (connection) {
          connection.requestClose();
        }

        const deepgram = createClient({ accessToken: token });
        const conn = deepgram.listen.live(options, endpoint);

        // Set up connection event listeners
        conn.addListener(LiveTranscriptionEvents.Open, () => {
          setConnectionState(SOCKET_STATES.open);
        });

        conn.addListener(LiveTranscriptionEvents.Close, () => {
          setConnectionState(SOCKET_STATES.closed);
        });

        conn.addListener(LiveTranscriptionEvents.Error, (error) => {
          conn.requestClose();
          setConnectionState(SOCKET_STATES.closed);
          throw error;
        });

        setConnection(conn);
      } catch (error) {
        captureException(error);
        setConnectionState(SOCKET_STATES.closed);
        throw error;
      }
    },
    [connection, getValidToken],
  );

  // Gracefully close the WebSocket connection
  const disconnectFromDeepgram = useCallback(() => {
    if (connection) {
      connection.requestClose();
      setConnection(null);
      setConnectionState(SOCKET_STATES.closed);
    }
  }, [connection]);

  // Cleanup: close connection when component unmounts
  useEffect(() => {
    return () => {
      if (connection) connection.requestClose();
    };
  }, [connection]);

  return {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
    isLoadingToken,
    tokenError,
  };
};
