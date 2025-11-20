import { z } from 'zod';

import { Resource, ResourceBehaviors, ResourceConfig, ResourceEndpoints } from '../types';
import { getResourceRegistry } from './registry';

// Default behaviors
const DEFAULT_BEHAVIORS: ResourceBehaviors = {
  optimistic: {
    create: 'append',
    update: 'merge',
    delete: 'remove',
  },
  liveSync: false,
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
};

// API client factory
function createApiClient(endpoints: ResourceEndpoints) {
  return {
    list: async () => {
      if (typeof endpoints.list === 'string') {
        const response = await fetch(endpoints.list);
        return response.json();
      }
      return endpoints.list?.(fetch);
    },

    get: async (id: string) => {
      if (typeof endpoints.get === 'string') {
        const url = endpoints.get.replace(':id', id);
        const response = await fetch(url);
        return response.json();
      }
      return endpoints.get?.(fetch, id);
    },

    create: async (data: unknown) => {
      if (typeof endpoints.create === 'string') {
        const response = await fetch(endpoints.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      }
      return endpoints.create?.(fetch, data);
    },

    update: async (id: string, data: unknown) => {
      if (typeof endpoints.update === 'string') {
        const url = endpoints.update.replace(':id', id);
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      }
      return endpoints.update?.(fetch, id, data);
    },

    delete: async (id: string) => {
      if (typeof endpoints.delete === 'string') {
        const url = endpoints.delete.replace(':id', id);
        const response = await fetch(url, { method: 'DELETE' });
        return response.json();
      }
      return endpoints.delete?.(fetch, id);
    },
  };
}

/**
 * Define a resource with schema, endpoints, and behaviors
 */
export function defineResource<T extends z.ZodTypeAny>(config: ResourceConfig<T>): Resource {
  const { name, schema, endpoints, behaviors = {}, relations = {} } = config;

  // Merge with default behaviors
  const mergedBehaviors = {
    ...DEFAULT_BEHAVIORS,
    ...behaviors,
    optimistic: {
      ...DEFAULT_BEHAVIORS.optimistic,
      ...behaviors.optimistic,
    },
    cache: {
      ...DEFAULT_BEHAVIORS.cache,
      ...behaviors.cache,
    },
  };

  // Create API client
  const api = createApiClient(endpoints);

  // Create resource instance
  const resource: Resource = {
    name,
    schema,
    endpoints,
    behaviors: mergedBehaviors,
    relations: {
      hasMany: relations.hasMany || [],
      belongsTo: relations.belongsTo || [],
    },
    api,
  };

  // Register the resource
  const registry = getResourceRegistry();
  registry.register(resource);

  return resource;
}

/**
 * Validate data against resource schema
 */
export function validateResourceData<T>(resource: Resource, data: unknown): T {
  return resource.schema.parse(data) as T;
}

/**
 * Create optimistic update for resource
 */
export function createOptimisticUpdate<T extends { id: string }>(
  resource: Resource,
  action: 'create' | 'update' | 'delete',
  data: Partial<T> & { id?: string },
  existingData: T[],
): T[] {
  const { optimistic } = resource.behaviors;

  if (!optimistic) return existingData;

  switch (action) {
    case 'create':
      if (optimistic.create === 'append') {
        return [...existingData, { ...data, id: `temp-${Date.now()}` } as T];
      }
      if (optimistic.create === 'prepend') {
        return [{ ...data, id: `temp-${Date.now()}` } as T, ...existingData];
      }
      return existingData;

    case 'update':
      if (optimistic.update === 'merge') {
        return existingData.map((item) => (item.id === data.id ? ({ ...item, ...data } as T) : item));
      }
      if (optimistic.update === 'replace') {
        return existingData.map((item) => (item.id === data.id ? (data as T) : item));
      }
      return existingData;

    case 'delete':
      if (optimistic.delete === 'remove') {
        return existingData.filter((item) => item.id !== data.id);
      }
      if (optimistic.delete === 'hide') {
        return existingData.map((item) => (item.id === data.id ? { ...item, _deleted: true } : item));
      }
      return existingData;

    default:
      return existingData;
  }
}
