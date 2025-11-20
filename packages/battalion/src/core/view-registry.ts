import { View, ViewConfig, ViewName, ViewRegistry } from '../types';

/**
 * View Registry for managing all registered views
 */
class ViewRegistryImpl implements ViewRegistry {
  private views = new Map<ViewName, View>();

  /**
   * Register a new view
   */
  register(config: ViewConfig): View {
    const view = config as View;

    if (this.views.has(view.name)) {
      throw new Error(`View '${view.name}' is already registered`);
    }

    this.views.set(view.name, view);
    return view;
  }

  /**
   * Get a view by name
   */
  get(name: ViewName): View | undefined {
    return this.views.get(name);
  }

  /**
   * Get all registered views
   */
  getAll(): View[] {
    return Array.from(this.views.values());
  }

  /**
   * Check if a view exists
   */
  has(name: ViewName): boolean {
    return this.views.has(name);
  }

  /**
   * Unregister a view
   */
  unregister(name: ViewName): boolean {
    return this.views.delete(name);
  }

  /**
   * Clear all views
   */
  clear(): void {
    this.views.clear();
  }

  /**
   * Get view names
   */
  getNames(): ViewName[] {
    return Array.from(this.views.keys());
  }

  /**
   * Get views that use a specific resource
   */
  getViewsUsingResource(resourceName: string): View[] {
    return this.getAll().filter((view) => view.uses.some((use) => use.entity === resourceName));
  }

  /**
   * Get views with specific dependency pattern
   */
  getViewsWithDependency(dependencyPattern: {
    entity?: string;
    alias?: string;
    dependsOn?: string[];
    lazy?: boolean;
  }): View[] {
    return this.getAll().filter((view) =>
      view.uses.some((use) => {
        if (dependencyPattern.entity && use.entity !== dependencyPattern.entity) return false;
        if (dependencyPattern.alias && use.alias !== dependencyPattern.alias) return false;
        if (dependencyPattern.dependsOn) {
          // Compare arrays - check if dependsOn arrays match
          if (!use.dependsOn || use.dependsOn.length !== dependencyPattern.dependsOn.length) return false;
          const matches = use.dependsOn.every((alias, index) => {
            return alias === dependencyPattern.dependsOn![index];
          });
          if (!matches) return false;
        }
        if (dependencyPattern.lazy !== undefined && use.lazy !== dependencyPattern.lazy) return false;
        return true;
      }),
    );
  }

  /**
   * Validate all views
   */
  validateViews(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.views.forEach((view, viewName) => {
      // Check for duplicate aliases within a view
      const aliases = view.uses.map((use) => use.alias || use.entity);
      const duplicateAliases = aliases.filter((alias, index) => aliases.indexOf(alias) !== index);

      if (duplicateAliases.length > 0) {
        errors.push(`View '${viewName}' has duplicate aliases: ${duplicateAliases.join(', ')}`);
      }

      // Check for circular dependencies
      const dependencyGraph = new Map<string, string[]>();

      view.uses.forEach((use) => {
        const key = use.alias || use.entity;
        if (use.dependsOn) {
          // dependsOn is string[] - array of aliases
          use.dependsOn.forEach((alias) => {
            const dependents = dependencyGraph.get(alias) || [];
            dependents.push(key);
            dependencyGraph.set(alias, dependents);
          });
        }
      });

      // Check for cycles
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

      dependencyGraph.forEach((_, node) => {
        if (hasCycle(node)) {
          errors.push(`View '${viewName}' has circular dependency involving '${node}'`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Global registry instance
let globalViewRegistry: ViewRegistry | null = null;

/**
 * Get the global view registry
 */
export function getViewRegistry(): ViewRegistry {
  if (!globalViewRegistry) {
    globalViewRegistry = new ViewRegistryImpl();
  }
  return globalViewRegistry;
}

/**
 * Create a new view registry instance
 */
export function createViewRegistry(): ViewRegistry {
  return new ViewRegistryImpl();
}

/**
 * Reset the global view registry (useful for testing)
 */
export function resetViewRegistry(): void {
  globalViewRegistry = null;
}
