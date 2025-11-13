'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient, LiveClient, type LiveSchema, LiveTranscriptionEvents, SOCKET_STATES } from '@deepgram/sdk';
import { captureException } from '@sentry/browser';
import { useGetDeepgramAccessTokenQuery } from '@/apis/deepgram';

interface UseDeepgramConnectionReturn {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  isLoadingToken: boolean;
  tokenError: boolean;
}

interface TokenMetadata {
  token: string;
  fetchedAt: number;
  expiresIn: number;
}

// Refresh token 5 minutes before expiration
const TOKEN_REFRESH_BUFFER = 300;

//Time to live for the access token
const TOKEN_TTL = 3600;

/**
 * Hook to manage Deepgram WebSocket connection lifecycle with automatic token refresh
 */
export const useDeepgramConnection = (): UseDeepgramConnectionReturn => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);

  // Store token metadata in ref to avoid unnecessary re-renders
  const tokenMetadataRef = useRef<TokenMetadata | null>(null);

  // Fetch Deepgram access token with 1-hour TTL
  const {
    data: accessTokenResponse,
    isLoading: isLoadingAccessToken,
    isError: isTokenError,
    refetch: refetchToken,
  } = useGetDeepgramAccessTokenQuery({ ttl_seconds: TOKEN_TTL });

  // Update token metadata when new token is received
  useEffect(() => {
    if (accessTokenResponse?.access_token && accessTokenResponse?.expires_in) {
      tokenMetadataRef.current = {
        token: accessTokenResponse.access_token,
        fetchedAt: Date.now(),
        expiresIn: accessTokenResponse.expires_in,
      };
    }
  }, [accessTokenResponse]);

  // Check if token needs refresh based on expiration time and buffer
  const isTokenExpiredOrExpiring = useCallback((): boolean => {
    if (!tokenMetadataRef.current) return true;
    const { fetchedAt, expiresIn } = tokenMetadataRef.current;
    const elapsed = (Date.now() - fetchedAt) / 1000;
    const remaining = expiresIn - elapsed;

    return remaining <= TOKEN_REFRESH_BUFFER;
  }, []);

  // Get valid token, refreshing if necessary
  const getValidToken = useCallback(async (): Promise<string> => {
    if (isTokenExpiredOrExpiring()) {
      const result = await refetchToken();

      if (result.data?.access_token) {
        return result.data.access_token;
      }
      throw new Error('Failed to refresh Deepgram access token');
    }
    if (!tokenMetadataRef.current?.token) {
      throw new Error('No Deepgram access token available');
    }

    return tokenMetadataRef.current.token;
  }, [isTokenExpiredOrExpiring, refetchToken]);

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
    isLoadingToken: isLoadingAccessToken,
    tokenError: isTokenError,
  };
};
