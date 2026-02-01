import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { TransactionResponse } from '../transactions/client';

// Base types
export type ResourceName = string;
export type QueryKey = string[];

// Storage type constant (per project conventions - avoid enums)
export const STORAGE_TYPE = {
  INDEXEDDB: 'indexeddb',
  OPFS: 'opfs',
} as const;

export type StorageType = (typeof STORAGE_TYPE)[keyof typeof STORAGE_TYPE];

// Default persist configuration values
export const DEFAULT_PERSIST_CONFIG = {
  storage: STORAGE_TYPE.INDEXEDDB,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Persist configuration
export interface PersistConfig {
  /**
   * Storage type to use for persistence.
   * @default 'indexeddb'
   */
  storage?: StorageType;
  /**
   * Max age for persisted data (ms).
   * @default 24 * 60 * 60 * 1000 (24 hours)
   */
  maxAge?: number;
}

// Resource endpoints
export interface ResourceEndpoints {
  list?: string | ((client: typeof fetch) => Promise<unknown>);
  get?: string | ((client: typeof fetch, id: string) => Promise<unknown>);
  create?: string | ((client: typeof fetch, data: unknown) => Promise<unknown>);
  update?: string | ((client: typeof fetch, id: string, data: unknown) => Promise<unknown>);
  delete?: string | ((client: typeof fetch, id: string) => Promise<unknown>);
}

// Resource dependency
export interface ResourceDependency {
  resource: ResourceName;
  alias?: string;
  lazy?: boolean;
  extractParams?: (parentData: unknown) => Record<string, unknown>;
}

// Optimistic update config
export interface OptimisticConfig<T = unknown> {
  create?: 'append' | 'prepend';
  update?: 'merge' | 'replace';
  delete?: 'remove' | 'hide';
  /**
   * Function to create a full optimistic item from partial data.
   * This ensures the optimistic item matches the resource schema.
   * @param data - Partial data provided by the user
   * @returns Full item matching the resource schema
   */
  getOptimisticItem?: (data: Partial<T>) => T;
}

// Transaction configuration
export interface TransactionConfig<T = unknown> {
  create?: string;
  update?: string;
  delete?: string;
  resourceType: string;
  /**
   * The field name used as the unique identifier for items.
   * Defaults to 'id' if not specified.
   */
  idField?: string;
  optimistic?: OptimisticConfig<T>;
  retry?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  };
  onSuccess?: {
    create?: (data: unknown) => void;
    update?: (id: string, data: unknown) => void;
    delete?: (id: string) => void;
  };
  onRollback?: {
    create?: (data: unknown, error: Error) => void;
    update?: (id: string, data: unknown, error: Error) => void;
    delete?: (id: string, error: Error) => void;
  };
  transformPayload?: {
    create?: (data: unknown) => Record<string, unknown>;
    update?: (data: unknown) => Record<string, unknown>;
    delete?: (data: unknown) => Record<string, unknown>;
  };
}

// SSE event configuration for live sync
export interface SSEEventConfig {
  /**
   * Event name to listen for (e.g., "process", "page").
   * When this event is received via the EventBus, it triggers a refetch of the resource data.
   */
  event: string;
}

// Live sync configuration
export interface LiveSyncConfig {
  enabled: boolean;
  strategy: 'polling' | 'sse';
  interval?: number;
  endpoint?: string;
  /**
   * SSE event configuration (required when strategy is 'sse').
   * Specifies which EventBus event to subscribe to for live updates.
   */
  sseConfig?: SSEEventConfig;
}

// Cache configuration
export interface CacheConfig {
  staleTime?: number;
  gcTime?: number;
}

// Resource configuration
export interface ResourceConfig<T extends z.ZodTypeAny> {
  name: ResourceName;
  schema: T;
  endpoints: ResourceEndpoints;
  relations?: {
    hasMany?: ResourceName[];
    belongsTo?: ResourceName[];
  };
  dependsOn?: ResourceDependency[];
  transactions?: TransactionConfig<z.infer<T>>;
  liveSync?: LiveSyncConfig;
  /**
   * Enable persistence for instant loading on revisit.
   * - `true` - Enable with defaults (IndexedDB, 24h maxAge)
   * - `{ storage: 'opfs', maxAge: ... }` - Custom config
   * - `undefined` - No persistence
   */
  persist?: boolean | PersistConfig;
  cache?: CacheConfig;
  /**
   * Transform the API response before storing in cache.
   * Use this when the API returns a wrapper object (e.g., { items: [], total: 0 })
   * and you need to extract the array.
   *
   * @example
   * // API returns { processes: Process[], total_count: number }
   * transformResponse: (response) => response.processes
   */
  transformResponse?: (response: unknown) => z.infer<T>[];
}

// Resource instance
export interface Resource<T = unknown> {
  name: ResourceName;
  schema: z.ZodTypeAny;
  endpoints: ResourceEndpoints;
  relations: {
    hasMany: ResourceName[];
    belongsTo: ResourceName[];
  };
  dependsOn?: ResourceDependency[];
  transactions?: TransactionConfig<T>;
  liveSync?: LiveSyncConfig;
  /**
   * Persistence configuration for instant loading.
   */
  persist?: boolean | PersistConfig;
  cache?: CacheConfig;
  /**
   * Transform the API response before storing in cache.
   */
  transformResponse?: (response: unknown) => T[];
  api: {
    list: () => Promise<T[]>;
    get: (id: string) => Promise<T>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  };
}

// Batch operation
export interface BatchOperation {
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  id?: string;
}

// Failed transaction
export interface FailedTransaction {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  error: Error;
  timestamp: Date;
  resourceName: string;
  /**
   * Transaction API response details for failed transactions
   * Only present when the error is a TransactionFailureError
   */
  transactionResponse?: TransactionResponse[];
}

// Transaction state
export interface TransactionState {
  pending: number;
  pendingIds: string[];
  hasPending: boolean;
  retrying: number;
  failed: number;
}

// Error state
export interface ErrorState {
  lastError: Error | null;
  failedTransactions: FailedTransaction[];
}

// Live sync state
export interface LiveSyncState {
  isConnected: boolean;
  lastSyncAt: Date | null;
  error?: Error;
  /**
   * Whether data was loaded from cache
   */
  loadedFromCache?: boolean;
  /**
   * Whether background sync is in progress
   */
  isSyncing?: boolean;
}

// Resource hook options
export interface ResourceOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  queryClient?: QueryClient;
}

// Resource hook return type
export interface ResourceHookReturn<T> {
  data: T[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isStale: boolean;
  error: Error | null;
  create: (data: Partial<T>) => void;
  update: (id: string, data: Partial<T>) => void;
  delete: (id: string) => void;
  batch: (operations: BatchOperation[]) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  getDependency: <D>(resourceName: string) => D | undefined;
  sync: LiveSyncState;
  transactions: TransactionState;
  errors: ErrorState;
  refetch: () => void;
  invalidate: () => void;
}

// Meta state
export interface MetaState {
  isLoading: boolean;
  hasError: boolean;
  isStale: boolean;
  isOptimistic: boolean;
  errors: Error[];
}

// Registry types
export interface ResourceRegistry {
  register<T extends z.ZodTypeAny>(config: ResourceConfig<T>): Resource;
  get(name: ResourceName): Resource | undefined;
  getAll(): Resource[];
  has(name: ResourceName): boolean;
  unregister(name: ResourceName): boolean;
  clear(): void;
  getNames(): ResourceName[];
  getByRelation(relationType: 'hasMany' | 'belongsTo', targetResource: ResourceName): Resource[];
  buildDependencyGraph(): Map<ResourceName, ResourceName[]>;
  validateDependencies(): { valid: boolean; errors: string[] };
}

/**
 * Live sync state for a resource
 */
export interface LiveSyncState {
  isConnected: boolean;
  lastSyncAt: Date | null;
  error?: Error;
  /**
   * Whether data was loaded from cache
   */
  loadedFromCache?: boolean;
  /**
   * Whether background sync is in progress
   */
  isSyncing?: boolean;
}

/**
 * Stored resource data with metadata
 */
export interface StoredResourceData<T = unknown> {
  resourceName: ResourceName;
  data: T;
  timestamp: number;
  version: number;
}

/**
 * Storage adapter interface for persistence
 */
export interface StorageAdapter {
  save<T>(resourceName: ResourceName, data: T): Promise<void>;
  load<T>(resourceName: ResourceName): Promise<T | null>;
  loadWithMetadata<T>(resourceName: ResourceName): Promise<StoredResourceData<T> | null>;
  delete(resourceName: ResourceName): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Resolved persist configuration
 */
export interface ResolvedPersistConfig {
  enabled: boolean;
  storage: StorageType;
  maxAge: number;
}
