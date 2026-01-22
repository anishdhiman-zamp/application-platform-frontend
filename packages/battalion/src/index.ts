// Core exports
export { getLiveSyncManager, resetLiveSyncManager } from './core/live-sync';
export { getQueryGraph, resetQueryGraph } from './core/query-graph';
export { getResourceRegistry, resetResourceRegistry } from './core/registry';
export { defineResource, getResource } from './core/resource';

// Hook exports
export { useMetaState, useResource } from './hooks';

// Transaction exports
export { transactionStore } from './transactions/store';
// TransactionProvider is optional - only needed for custom config
export { TransactionProvider, type TransactionProviderProps } from './transactions/provider';

// Type exports
export type {
  BatchOperation,
  CacheConfig,
  ErrorState,
  FailedTransaction,
  LiveSyncConfig,
  LiveSyncState,
  MetaState,
  OptimisticConfig,
  PersistConfig,
  QueryKey,
  Resource,
  ResourceConfig,
  ResourceDependency,
  ResourceEndpoints,
  ResourceHookReturn,
  ResourceName,
  ResourceOptions,
  ResourceRegistry,
  StorageType,
  TransactionConfig,
  TransactionState,
} from './types';

// Persistence constants
export { DEFAULT_PERSIST_CONFIG, STORAGE_TYPE } from './types';

// Client config type for custom configuration
export type { TransactionClientConfig } from './transactions/client';
