import { QueryClient } from '@tanstack/react-query';

import { Resource, ResourceName } from '../types';
import { getResourceRegistry } from './registry';

export type QueryKey = string[];

export interface ResourceQueryNode {
  resourceName: ResourceName;
  queryKey: QueryKey;
  dependsOn: ResourceName[];
  dependents: ResourceName[];
  state: 'idle' | 'fetching' | 'success' | 'error';
  data?: unknown;
  error?: Error;
  enabled: boolean;
  params?: Record<string, unknown>;
}

class ResourceQueryGraphImpl {
  private nodes = new Map<ResourceName, ResourceQueryNode>();
  private resourceRegistry = getResourceRegistry();

  addResource(resource: Resource, params?: Record<string, unknown>): void {
    if (this.nodes.has(resource.name)) return;

    const dependsOn: ResourceName[] = resource.relations.belongsTo || [];

    const node: ResourceQueryNode = {
      resourceName: resource.name,
      queryKey: [resource.name],
      dependsOn,
      dependents: [],
      state: 'idle',
      enabled: true,
      params,
    };

    this.nodes.set(resource.name, node);

    dependsOn.forEach((parentName) => {
      const parentNode = this.nodes.get(parentName);
      if (parentNode) parentNode.dependents.push(resource.name);
    });
  }

  buildDependencyOrder(): ResourceName[] {
    const visited = new Set<ResourceName>();
    const result: ResourceName[] = [];

    const visit = (resourceName: ResourceName) => {
      if (visited.has(resourceName)) return;
      visited.add(resourceName);
      const node = this.nodes.get(resourceName);
      if (!node) return;
      node.dependsOn.forEach((dep) => visit(dep));
      result.push(resourceName);
    };

    this.nodes.forEach((_, resourceName) => visit(resourceName));
    return result;
  }

  async executeInOrder(queryClient: QueryClient): Promise<void> {
    const order = this.buildDependencyOrder();

    for (const resourceName of order) {
      const node = this.nodes.get(resourceName);
      if (!node || !node.enabled) continue;

      const resource = this.resourceRegistry.get(resourceName);
      if (!resource) continue;

      node.state = 'fetching';

      try {
        const data = await queryClient.fetchQuery({
          queryKey: node.queryKey,
          queryFn: () => resource.api.list(),
          staleTime: resource.cache?.staleTime,
          gcTime: resource.cache?.gcTime,
        });
        node.data = data;
        node.state = 'success';
      } catch (error) {
        node.error = error instanceof Error ? error : new Error(String(error));
        node.state = 'error';
      }
    }
  }

  getNode(resourceName: ResourceName): ResourceQueryNode | undefined {
    return this.nodes.get(resourceName);
  }

  getAllNodes(): ResourceQueryNode[] {
    return Array.from(this.nodes.values());
  }

  hasPendingDependencies(resourceName: ResourceName): boolean {
    const node = this.nodes.get(resourceName);
    if (!node) return false;
    return node.dependsOn.some((depName) => {
      const depNode = this.nodes.get(depName);
      return depNode && depNode.state !== 'success';
    });
  }

  getDependencyData(resourceName: ResourceName): unknown | undefined {
    const node = this.nodes.get(resourceName);
    return node?.state === 'success' ? node.data : undefined;
  }

  clear(): void {
    this.nodes.clear();
  }

  removeResource(resourceName: ResourceName): void {
    const node = this.nodes.get(resourceName);
    if (!node) return;
    node.dependsOn.forEach((parentName) => {
      const parentNode = this.nodes.get(parentName);
      if (parentNode) {
        parentNode.dependents = parentNode.dependents.filter((d) => d !== resourceName);
      }
    });
    this.nodes.delete(resourceName);
  }

  has(resourceName: ResourceName): boolean {
    return this.nodes.has(resourceName);
  }

  getAggregateState(): { isLoading: boolean; hasError: boolean; errors: Error[] } {
    let isLoading = false;
    let hasError = false;
    const errors: Error[] = [];

    this.nodes.forEach((node) => {
      if (node.state === 'fetching') isLoading = true;
      if (node.state === 'error') {
        hasError = true;
        if (node.error) errors.push(node.error);
      }
    });

    return { isLoading, hasError, errors };
  }
}

let globalQueryGraph: ResourceQueryGraphImpl | null = null;

export function getQueryGraph(): ResourceQueryGraphImpl {
  if (!globalQueryGraph) globalQueryGraph = new ResourceQueryGraphImpl();
  return globalQueryGraph;
}

export function createQueryGraph(): ResourceQueryGraphImpl {
  return new ResourceQueryGraphImpl();
}

export function resetQueryGraph(): void {
  globalQueryGraph = null;
}

export { ResourceQueryGraphImpl as ResourceQueryGraph };
