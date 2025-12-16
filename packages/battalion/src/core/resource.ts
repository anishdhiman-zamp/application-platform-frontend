import { API_DOMAIN } from '@zamp-platform/api';
import { z } from 'zod';

import { CacheConfig, Resource, ResourceConfig, ResourceEndpoints } from '../types';
import { getQueryGraph } from './query-graph';
import { getResourceRegistry } from './registry';

const DEFAULT_CACHE: CacheConfig = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

const DEFAULT_RETRY = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * Get the base URL - uses API_DOMAIN from @zamp-platform/api
 * which handles multi-region support
 */
function getBaseUrl(): string {
  return API_DOMAIN;
}

/**
 * Build full URL from base and endpoint
 */
function buildUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  // If endpoint already starts with http or /, use as-is
  if (endpoint.startsWith('http') || endpoint.startsWith('/')) {
    return endpoint;
  }
  // Otherwise, prepend baseUrl
  return `${baseUrl}/${endpoint}`;
}

/**
 * Handle fetch response - throws on error
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }
  return response.json();
}

function createApiClient(endpoints: ResourceEndpoints) {
  return {
    list: async () => {
      if (typeof endpoints.list === 'string') {
        const response = await fetch(buildUrl(endpoints.list), {
          credentials: 'include',
        });
        return handleResponse(response);
      }
      return endpoints.list?.(fetch);
    },
    get: async (id: string) => {
      if (typeof endpoints.get === 'string') {
        const url = buildUrl(endpoints.get).replace(':id', id);
        const response = await fetch(url, {
          credentials: 'include',
        });
        return handleResponse(response);
      }
      return endpoints.get?.(fetch, id);
    },
    create: async (data: unknown) => {
      if (typeof endpoints.create === 'string') {
        const response = await fetch(buildUrl(endpoints.create), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      }
      return endpoints.create?.(fetch, data);
    },
    update: async (id: string, data: unknown) => {
      if (typeof endpoints.update === 'string') {
        const url = buildUrl(endpoints.update).replace(':id', id);
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      }
      return endpoints.update?.(fetch, id, data);
    },
    delete: async (id: string) => {
      if (typeof endpoints.delete === 'string') {
        const url = buildUrl(endpoints.delete).replace(':id', id);
        const response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        });
        return handleResponse(response);
      }
      return endpoints.delete?.(fetch, id);
    },
  };
}

export function defineResource<T extends z.ZodTypeAny>(config: ResourceConfig<T>): Resource {
  const { name, schema, endpoints, relations = {} } = config;

  const transactionConfig = config.transactions
    ? {
        ...config.transactions,
        retry: { ...DEFAULT_RETRY, ...config.transactions.retry },
      }
    : undefined;

  const resource: Resource = {
    name,
    schema,
    endpoints,
    relations: {
      hasMany: relations.hasMany || [],
      belongsTo: relations.belongsTo || [],
    },
    dependsOn: config.dependsOn,
    transactions: transactionConfig,
    liveSync: config.liveSync,
    cache: config.cache || DEFAULT_CACHE,
    api: createApiClient(endpoints),
  };

  getResourceRegistry().register(resource);
  getQueryGraph().addResource(resource);

  return resource;
}

export function getResource(name: string): Resource | undefined {
  return getResourceRegistry().get(name);
}
