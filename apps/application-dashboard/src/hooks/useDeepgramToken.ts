'use client';

import { useCallback, useEffect } from 'react';
import { useGetDeepgramAccessTokenQuery } from '@/apis/deepgram';

interface TokenMetadata {
  token: string;
  fetchedAt: number;
  expiresIn: number;
}

interface UseDeepgramTokenReturn {
  getValidToken: () => Promise<string>;
  isLoadingToken: boolean;
  tokenError: boolean;
}

// Refresh token 5 minutes before expiration
const TOKEN_REFRESH_BUFFER = 300;

// Time to live for the access token
const TOKEN_TTL = 3600;

// Module-level token storage to persist across component unmounts/remounts
let globalTokenMetadata: TokenMetadata | null = null;

/**
 * Check if token needs refresh based on expiration time and buffer
 */
const isTokenExpiredOrExpiring = (): boolean => {
  if (!globalTokenMetadata) return true;
  const { fetchedAt, expiresIn } = globalTokenMetadata;
  const elapsed = (Date.now() - fetchedAt) / 1000;
  const remaining = expiresIn - elapsed;

  return remaining <= TOKEN_REFRESH_BUFFER;
};

/**
 * Hook to manage Deepgram access token with automatic refresh
 * Token is stored at module level to persist across component unmounts/remounts
 */
export const useDeepgramToken = (): UseDeepgramTokenReturn => {
  // Only fetch token if we don't have a valid one
  const shouldSkipTokenFetch = !isTokenExpiredOrExpiring();

  // Fetch Deepgram access token with 1-hour TTL, but skip if we already have a valid token
  // Note: Even when skipped, RTK Query may return cached data from previous fetches
  const {
    data: accessTokenResponse,
    isLoading: isLoadingAccessToken,
    isError: isTokenError,
    refetch: refetchToken,
  } = useGetDeepgramAccessTokenQuery({ ttl_seconds: TOKEN_TTL }, { skip: shouldSkipTokenFetch });

  // Update global token metadata when new token is received (from fetch or cache)
  // This ensures globalTokenMetadata stays in sync with RTK Query cache
  useEffect(() => {
    if (accessTokenResponse?.access_token && accessTokenResponse?.expires_in) {
      // Only update if we don't have a token or if the cached token is different/newer
      if (!globalTokenMetadata || globalTokenMetadata.token !== accessTokenResponse.access_token) {
        globalTokenMetadata = {
          token: accessTokenResponse.access_token,
          fetchedAt: Date.now(),
          expiresIn: accessTokenResponse.expires_in,
        };
      }
    }
  }, [accessTokenResponse]);

  // Get valid token, refreshing if necessary
  const getValidToken = useCallback(async (): Promise<string> => {
    if (isTokenExpiredOrExpiring()) {
      const result = await refetchToken();

      if (result.data?.access_token) {
        return result.data.access_token;
      }
      throw new Error('Failed to refresh Deepgram access token');
    }
    if (!globalTokenMetadata?.token) {
      throw new Error('No Deepgram access token available');
    }

    return globalTokenMetadata.token;
  }, [refetchToken]);

  return {
    getValidToken,
    isLoadingToken: isLoadingAccessToken,
    tokenError: isTokenError,
  };
};
