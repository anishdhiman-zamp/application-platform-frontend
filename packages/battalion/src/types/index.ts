import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Base types
export type ResourceName = string;
export type ViewName = string;
export type QueryKey = string[];
export type MutationKey = string[];

// Resource types
export interface ResourceEndpoints {
  list?: string | ((client: typeof fetch) => Promise<unknown>);
  get?: string | ((client: typeof fetch, id: string) => Promise<unknown>);
  create?: string | ((client: typeof fetch, data: unknown) => Promise<unknown>);
  update?: string | ((client: typeof fetch, id: string, data: unknown) => Promise<unknown>);
  delete?: string | ((client: typeof fetch, id: string) => Promise<unknown>);
}

export interface ResourceBehaviors {
  optimistic?: {
    create?: 'append' | 'prepend' | 'replace';
    update?: 'merge' | 'replace';
    delete?: 'remove' | 'hide';
  };
  liveSync?: boolean;
  cache?: {
    staleTime?: number;
    gcTime?: number;
  };
}

export interface ResourceConfig<T extends z.ZodTypeAny> {
  name: ResourceName;
  schema: T;
  endpoints: ResourceEndpoints;
  behaviors?: ResourceBehaviors;
  relations?: {
    hasMany?: ResourceName[];
    belongsTo?: ResourceName[];
  };
}

export interface Resource<T = unknown> {
  name: ResourceName;
  schema: z.ZodTypeAny;
  endpoints: ResourceEndpoints;
  behaviors: ResourceBehaviors;
  relations: {
    hasMany: ResourceName[];
    belongsTo: ResourceName[];
  };
  api: {
    list: () => Promise<T[]>;
    get: (id: string) => Promise<T>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  };
}

// View types
export interface ViewDependency {
  entity: ResourceName;
  alias?: string;
  dependsOn?: string[]; // Array of aliases (strings) - converted to QueryKey[] internally
  lazy?: boolean;
  params?: Record<string, unknown>;
}

export interface ViewConfig {
  name: ViewName;
  uses: ViewDependency[];
}

export interface View {
  name: ViewName;
  uses: ViewDependency[];
}

// Query Graph types
export interface QueryNode {
  key: QueryKey;
  entity: ResourceName;
  dependsOn: string[];
  dependents: QueryKey[];
  state: 'idle' | 'fetching' | 'success' | 'error';
  data?: unknown;
  error?: Error;
  enabled: boolean;
}

export interface QueryGraph {
  nodes: Map<string, QueryNode>;
  executionOrder: QueryKey[];
}

// MetaState types
export interface MetaState {
  isLoading: boolean;
  hasError: boolean;
  isStale: boolean;
  isOptimistic: boolean;
  errors: Error[];
}

// Hook types
export interface ResourceOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export interface ViewOptions {
  queryClient?: QueryClient;
  enabled?: boolean;
}

export interface ResourceHookReturn<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  create: (data: Partial<T>) => void;
  update: (id: string, data: Partial<T>) => void;
  delete: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface ViewHookReturn {
  data: Record<string, unknown>;
  actions: Record<string, (...args: unknown[]) => void>;
  uiState: MetaState;
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

export interface ViewRegistry {
  register(config: ViewConfig): View;
  get(name: ViewName): View | undefined;
  getAll(): View[];
  has(name: ViewName): boolean;
  unregister(name: ViewName): boolean;
  clear(): void;
  getNames(): ViewName[];
  getViewsUsingResource(resourceName: string): View[];
  getViewsWithDependency(dependencyPattern: {
    entity?: string;
    alias?: string;
    dependsOn?: string[];
    lazy?: boolean;
  }): View[];
  validateViews(): { valid: boolean; errors: string[] };
}

// Orchestrator types
export interface Orchestrator {
  runView(viewName: ViewName): ViewHookReturn;
  activateNode(nodeId: string): void;
  mutate(entity: ResourceName, action: string, args: unknown): Promise<unknown>;
  aggregateState(): MetaState;
}

// Sync types
export interface SyncOptions {
  interval?: number;
  enabled?: boolean;
}

export interface SyncUpdate {
  entity: ResourceName;
  id: string;
  data: unknown;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
}
