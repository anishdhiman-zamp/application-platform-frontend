import { z } from 'zod';

import { Resource, ResourceConfig, ResourceName, ResourceRegistry } from '../types';

/**
 * Resource Registry for managing all registered resources
 */
class ResourceRegistryImpl implements ResourceRegistry {
  private resources = new Map<ResourceName, Resource>();

  /**
   * Register a new resource
   */
  register(config: ResourceConfig<z.ZodTypeAny>): Resource {
    const resource = config as Resource;

    if (this.resources.has(resource.name)) {
      throw new Error(`Resource '${resource.name}' is already registered`);
    }

    this.resources.set(resource.name, resource);
    return resource;
  }

  /**
   * Get a resource by name
   */
  get(name: ResourceName): Resource | undefined {
    return this.resources.get(name);
  }

  /**
   * Get all registered resources
   */
  getAll(): Resource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Check if a resource exists
   */
  has(name: ResourceName): boolean {
    return this.resources.has(name);
  }

  /**
   * Unregister a resource
   */
  unregister(name: ResourceName): boolean {
    return this.resources.delete(name);
  }

  /**
   * Clear all resources
   */
  clear(): void {
    this.resources.clear();
  }

  /**
   * Get resource names
   */
  getNames(): ResourceName[] {
    return Array.from(this.resources.keys());
  }

  /**
   * Get resources by relation
   */
  getByRelation(relationType: 'hasMany' | 'belongsTo', targetResource: ResourceName): Resource[] {
    return this.getAll().filter((resource) => resource.relations[relationType].includes(targetResource));
  }

  /**
   * Build resource dependency graph
   */
  buildDependencyGraph(): Map<ResourceName, ResourceName[]> {
    const graph = new Map<ResourceName, ResourceName[]>();

    this.resources.forEach((resource, name) => {
      const dependencies = [...resource.relations.belongsTo, ...resource.relations.hasMany];
      graph.set(name, dependencies);
    });

    return graph;
  }

  /**
   * Validate resource dependencies
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const graph = this.buildDependencyGraph();

    // Check if all referenced resources exist
    graph.forEach((dependencies, resourceName) => {
      dependencies.forEach((depName) => {
        if (!this.has(depName)) {
          errors.push(`Resource '${resourceName}' references non-existent resource '${depName}'`);
        }
      });
    });

    // Check for circular dependencies
    const visited = new Set<ResourceName>();
    const recursionStack = new Set<ResourceName>();

    function hasCycle(node: ResourceName): boolean {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = graph.get(node) || [];
      for (const dependency of dependencies) {
        if (hasCycle(dependency)) return true;
      }

      recursionStack.delete(node);
      return false;
    }

    graph.forEach((_, node) => {
      if (hasCycle(node)) {
        errors.push(`Circular dependency detected involving resource '${node}'`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Global registry instance
let globalRegistry: ResourceRegistry | null = null;

/**
 * Get the global resource registry
 */
export function getResourceRegistry(): ResourceRegistry {
  if (!globalRegistry) {
    globalRegistry = new ResourceRegistryImpl();
  }
  return globalRegistry;
}

/**
 * Create a new resource registry instance
 */
export function createResourceRegistry(): ResourceRegistry {
  return new ResourceRegistryImpl();
}

/**
 * Reset the global registry (useful for testing)
 */
export function resetResourceRegistry(): void {
  globalRegistry = null;
}
