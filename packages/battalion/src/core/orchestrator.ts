import { QueryClient } from '@tanstack/react-query';

import {
  MetaState,
  Orchestrator,
  QueryGraph,
  QueryKey,
  QueryNode,
  ResourceName,
  View,
  ViewDependency,
  ViewHookReturn,
  ViewName,
} from '../types';
import { getResourceRegistry } from './registry';
import { getViewRegistry } from './view-registry';

/**
 * Query Graph Orchestrator
 * Manages the runtime Query Graph and coordinates data fetching
 */
class OrchestratorImpl implements Orchestrator {
  private queryClient: QueryClient;
  private resourceRegistry = getResourceRegistry();
  private viewRegistry = getViewRegistry();
  private activeGraphs = new Map<ViewName, QueryGraph>();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Run a view and return data, actions, and UI state
   */
  runView(viewName: ViewName): ViewHookReturn {
    const view = this.viewRegistry.get(viewName);
    if (!view) {
      throw new Error(`View '${viewName}' not found`);
    }

    // Build or get existing query graph
    let queryGraph = this.activeGraphs.get(viewName);
    if (!queryGraph) {
      queryGraph = this.buildQueryGraph(view);
      this.activeGraphs.set(viewName, queryGraph);
    }

    // Execute queries based on dependency order
    this.executeQueries(queryGraph);

    // Aggregate data from all nodes
    const data = this.aggregateData(queryGraph);

    // Generate actions
    const actions = this.generateActions(view);

    // Aggregate UI state
    const uiState = this.aggregateState();

    return {
      data,
      actions,
      uiState,
    };
  }

  /**
   * Activate a specific node in the query graph
   */
  activateNode(nodeId: string): void {
    // Find the node in active graphs
    for (const [, graph] of this.activeGraphs) {
      const node = graph.nodes.get(nodeId);
      if (node) {
        node.enabled = true;
        this.executeNode(node);
        break;
      }
    }
  }

  /**
   * Perform a mutation on a resource
   */
  async mutate(entity: ResourceName, action: string, args: unknown): Promise<unknown> {
    const resource = this.resourceRegistry.get(entity);
    if (!resource) {
      throw new Error(`Resource '${entity}' not found`);
    }

    // Get the appropriate API method
    const apiMethod = resource.api[action as keyof typeof resource.api];
    if (!apiMethod) {
      throw new Error(`Action '${action}' not found on resource '${entity}'`);
    }

    // Perform optimistic update if configured
    if (resource.behaviors.optimistic) {
      this.performOptimisticUpdate(entity, action, args);
    }

    try {
      // Execute the mutation based on action type
      let result: unknown;
      if (action === 'create') {
        result = await (apiMethod as (data: unknown) => Promise<unknown>)(args);
      } else if (action === 'update') {
        const updateArgs = args as { id: string; data: unknown };
        result = await (apiMethod as (id: string, data: unknown) => Promise<unknown>)(updateArgs.id, updateArgs.data);
      } else if (action === 'delete') {
        result = await (apiMethod as (id: string) => Promise<unknown>)(args as string);
      } else {
        result = await (apiMethod as (data: unknown) => Promise<unknown>)(args);
      }

      // Invalidate related queries
      this.invalidateRelatedQueries(entity);

      return result;
    } catch (error) {
      // Rollback optimistic update on error
      if (resource.behaviors.optimistic) {
        this.rollbackOptimisticUpdate(entity, action, args);
      }
      throw error;
    }
  }

  /**
   * Aggregate meta state from all active queries
   */
  aggregateState(): MetaState {
    const states = {
      isLoading: false,
      hasError: false,
      isStale: false,
      isOptimistic: false,
      errors: [] as Error[],
    };

    // Aggregate state from all active graphs
    for (const graph of this.activeGraphs.values()) {
      for (const node of graph.nodes.values()) {
        if (node.state === 'fetching') states.isLoading = true;
        if (node.state === 'error') {
          states.hasError = true;
          if (node.error) states.errors.push(node.error);
        }
        if (node.state === 'success' && node.data) {
          // Check if data is stale (simplified)
          states.isStale = false; // This would be determined by TanStack Query
        }
      }
    }

    return states;
  }

  /**
   * Build query graph from view dependencies
   */
  private buildQueryGraph(view: View): QueryGraph {
    const nodes = new Map<string, QueryNode>();
    const executionOrder: QueryKey[] = [];

    // Build nodes for each dependency
    view.uses.forEach((dep: ViewDependency) => {
      const key: QueryKey = [dep.alias || dep.entity];

      const node: QueryNode = {
        key,
        entity: dep.entity,
        dependsOn: dep.dependsOn || [], // Keep as string[] (aliases) for lookups
        dependents: [],
        state: 'idle',
        enabled: !dep.lazy,
      };

      nodes.set(key.join(':'), node);
      executionOrder.push(key);
    });

    // Build dependency relationships
    nodes.forEach((node) => {
      node.dependsOn.forEach((alias) => {
        // Use alias directly (string) for Map lookup
        const depNode = nodes.get(alias);
        if (depNode) {
          depNode.dependents.push(node.key);
        }
      });
    });

    return {
      nodes,
      executionOrder,
    };
  }

  /**
   * Execute queries in dependency order
   */
  private executeQueries(graph: QueryGraph): void {
    const executionOrder = this.getExecutionOrder(graph);

    executionOrder.forEach((nodeId) => {
      const node = graph.nodes.get(nodeId);
      if (node && node.enabled) {
        this.executeNode(node);
      }
    });
  }

  /**
   * Execute a single node
   */
  private executeNode(node: QueryNode): void {
    const resource = this.resourceRegistry.get(node.entity);
    if (!resource) return;

    node.state = 'fetching';

    // Use TanStack Query to execute the query
    this.queryClient
      .fetchQuery({
        queryKey: node.key,
        queryFn: () => resource.api.list(),
        staleTime: resource.behaviors.cache?.staleTime,
        gcTime: resource.behaviors.cache?.gcTime,
      })
      .then((data) => {
        node.data = data;
        node.state = 'success';
      })
      .catch((error) => {
        node.error = error;
        node.state = 'error';
      });
  }

  /**
   * Get execution order for queries
   */
  private getExecutionOrder(graph: QueryGraph): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    function visit(nodeId: string) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node) {
        // Visit dependencies first
        node.dependsOn.forEach((alias) => {
          // Use alias directly (string) for Map lookup
          visit(alias);
        });

        result.push(nodeId);
      }
    }

    // Visit all nodes
    graph.nodes.forEach((_, nodeId) => {
      visit(nodeId);
    });

    return result;
  }

  /**
   * Aggregate data from all nodes
   */
  private aggregateData(graph: QueryGraph): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    graph.nodes.forEach((node) => {
      if (node.state === 'success' && node.data) {
        const alias = node.key[0];
        data[alias] = node.data;
      }
    });

    return data;
  }

  /**
   * Generate actions for a view
   */
  private generateActions(view: View): Record<string, (...args: unknown[]) => void> {
    const actions: Record<string, (...args: unknown[]) => void> = {};

    view.uses.forEach((dep: ViewDependency) => {
      const resource = this.resourceRegistry.get(dep.entity);
      if (resource) {
        // Generate CRUD actions
        actions[`create${dep.entity}`] = (...args: unknown[]) => {
          const data = args[0];
          void this.mutate(dep.entity, 'create', data);
        };
        actions[`update${dep.entity}`] = (...args: unknown[]) => {
          const id = args[0] as string;
          const data = args[1];
          void this.mutate(dep.entity, 'update', { id, data });
        };
        actions[`delete${dep.entity}`] = (...args: unknown[]) => {
          const id = args[0] as string;
          void this.mutate(dep.entity, 'delete', id);
        };
      }
    });

    return actions;
  }

  /**
   * Perform optimistic update
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private performOptimisticUpdate(_entity: ResourceName, _action: string, _args: unknown): void {
    // Implementation would update TanStack Query cache optimistically
    // This is a simplified version
  }

  /**
   * Rollback optimistic update
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private rollbackOptimisticUpdate(_entity: ResourceName, _action: string, _args: unknown): void {
    // Implementation would rollback TanStack Query cache
    // This is a simplified version
  }

  /**
   * Invalidate related queries
   */
  private invalidateRelatedQueries(entity: ResourceName): void {
    // Invalidate all queries related to this entity
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === entity;
      },
    });
  }
}

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(queryClient: QueryClient): Orchestrator {
  return new OrchestratorImpl(queryClient);
}
