import { View, ViewConfig, ViewDependency } from '../types';
import { getViewRegistry } from './view-registry';

/**
 * Define a view with resource dependencies
 */
export function defineView(config: ViewConfig): View {
  const { name, uses } = config;

  // Validate dependencies
  validateViewDependencies(uses);

  const view: View = {
    name,
    uses,
  };

  // Register the view
  const registry = getViewRegistry();
  registry.register(view);

  return view;
}

/**
 * Validate view dependencies for circular references and invalid entities
 */
function validateViewDependencies(dependencies: ViewDependency[]): void {
  const entityMap = new Map<string, ViewDependency>();
  const dependencyGraph = new Map<string, string[]>();

  // Build dependency graph
  dependencies.forEach((dep) => {
    entityMap.set(dep.alias || dep.entity, dep);

    if (dep.dependsOn) {
      // dependsOn is string[] - array of aliases
      dep.dependsOn.forEach((alias) => {
        const dependents = dependencyGraph.get(alias) || [];
        // Push the current dependency (not the dependency alias)
        dependents.push(dep.alias || dep.entity);
        dependencyGraph.set(alias, dependents);
      });
    }
  });

  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const dependents = dependencyGraph.get(node) || [];
    for (const dependent of dependents) {
      if (hasCycle(dependent)) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  // Check all nodes for cycles
  for (const [node] of dependencyGraph) {
    if (hasCycle(node)) {
      throw new Error(`Circular dependency detected in view dependencies`);
    }
  }
}

/**
 * Build execution order for view dependencies
 */
export function buildExecutionOrder(dependencies: ViewDependency[]): ViewDependency[] {
  const visited = new Set<string>();
  const result: ViewDependency[] = [];

  function visit(dep: ViewDependency) {
    const key = dep.alias || dep.entity;

    if (visited.has(key)) return;
    visited.add(key);

    // Visit dependencies first
    if (dep.dependsOn) {
      // dependsOn is string[] - array of aliases
      dep.dependsOn.forEach((alias) => {
        const parentDep = dependencies.find((d) => (d.alias || d.entity) === alias);
        if (parentDep) {
          visit(parentDep);
        }
      });
    }

    result.push(dep);
  }

  dependencies.forEach(visit);
  return result;
}

/**
 * Get all dependencies for a specific entity
 */
export function getDependenciesForEntity(dependencies: ViewDependency[], entityName: string): ViewDependency[] {
  return dependencies.filter((dep) => dep.entity === entityName || dep.alias === entityName);
}

/**
 * Check if a dependency is lazy loaded
 */
export function isLazyDependency(dependency: ViewDependency): boolean {
  return dependency.lazy === true;
}

/**
 * Get all non-lazy dependencies
 */
export function getEagerDependencies(dependencies: ViewDependency[]): ViewDependency[] {
  return dependencies.filter((dep) => !isLazyDependency(dep));
}

/**
 * Get all lazy dependencies
 */
export function getLazyDependencies(dependencies: ViewDependency[]): ViewDependency[] {
  return dependencies.filter((dep) => isLazyDependency(dep));
}
