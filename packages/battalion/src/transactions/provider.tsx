'use client';

import React, { useEffect } from 'react';

import { TransactionClientConfig } from './client';
import { transactionStore } from './store';

export interface TransactionProviderProps {
  /** Optional custom config. If not provided, defaults from env vars are used. */
  config?: Partial<TransactionClientConfig>;
  children: React.ReactNode;
}

/**
 * TransactionProvider - Optional provider for custom transaction configuration.
 *
 * If you're fine with defaults (baseUrl from NEXT_PUBLIC_API_BASE_URL),
 * you don't need this provider at all - just use useResource directly.
 *
 * Only use this if you need custom config like auth headers or org ID getters.
 */
export function TransactionProvider({ config, children }: TransactionProviderProps) {
  useEffect(() => {
    if (config) {
      transactionStore.configure(config);
    }
  }, [config]);

  return <>{children}</>;
}
