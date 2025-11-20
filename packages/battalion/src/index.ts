// Core exports
export { createOrchestrator } from './core/orchestrator';
export { createResourceRegistry, getResourceRegistry, resetResourceRegistry } from './core/registry';
export { createOptimisticUpdate, defineResource, validateResourceData } from './core/resource';
export { buildExecutionOrder, defineView } from './core/view';
export { createViewRegistry, getViewRegistry, resetViewRegistry } from './core/view-registry';

// Hook exports
export { useMetaState, useResource, useView } from './hooks';

// Type exports
export type {
  MetaState,
  Orchestrator,
  QueryGraph,
  QueryNode,
  Resource,
  ResourceBehaviors,
  ResourceConfig,
  ResourceEndpoints,
  ResourceHookReturn,
  ResourceName,
  ResourceOptions,
  ResourceRegistry,
  SyncOptions,
  SyncUpdate,
  View,
  ViewConfig,
  ViewDependency,
  ViewHookReturn,
  ViewName,
  ViewOptions,
  ViewRegistry,
} from './types';
