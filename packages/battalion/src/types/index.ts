import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Base types
export type ResourceName = string;
export type QueryKey = string[];

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

// Live sync configuration
export interface LiveSyncConfig {
  enabled: boolean;
  strategy: 'polling' | 'sse';
  interval?: number;
  endpoint?: string;
  /**
   * Enable OPFS persistence for instant loading
   */
  persist?: boolean;
  /**
   * Max age for persisted data (ms)
   */
  persistMaxAge?: number;
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
  cache?: CacheConfig;
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
  cache?: CacheConfig;
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
