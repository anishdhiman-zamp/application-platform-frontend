import { API_DOMAIN } from '@zamp-platform/api';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
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

function createApiClient(endpoints: ResourceEndpoints, transformResponse?: (response: unknown) => unknown[]) {
  return {
    list: async () => {
      let result;
      if (typeof endpoints.list === 'string') {
        const response = await fetch(buildUrl(endpoints.list), {
          credentials: 'include',
          headers: {
            'X-Zamp-Organization-Id': getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
          },
        });
        result = await handleResponse(response);
      } else {
        result = await endpoints.list?.(fetch);
      }
      // Apply transform if provided, otherwise return as-is
      return transformResponse ? transformResponse(result) : result;
    },
    get: async (id: string) => {
      if (typeof endpoints.get === 'string') {
        const url = buildUrl(endpoints.get).replace(':id', id);
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'X-Zamp-Organization-Id': getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
          },
        });
        return handleResponse(response);
      }
      return endpoints.get?.(fetch, id);
    },
    create: async (data: unknown) => {
      if (typeof endpoints.create === 'string') {
        const response = await fetch(buildUrl(endpoints.create), {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            'X-Zamp-Organization-Id': getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
          },
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
          credentials: 'include',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            'X-Zamp-Organization-Id': getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
          },
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
          headers: {
            'X-Zamp-Organization-Id': getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID),
          },
        });
        return handleResponse(response);
      }
      return endpoints.delete?.(fetch, id);
    },
  };
}

export function defineResource<T extends z.ZodTypeAny>(config: ResourceConfig<T>): Resource {
  const { name, schema, endpoints, relations = {}, transformResponse } = config;

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
    persist: config.persist,
    cache: config.cache || DEFAULT_CACHE,
    transformResponse,
    api: createApiClient(endpoints, transformResponse),
  };

  getResourceRegistry().register(resource);
  getQueryGraph().addResource(resource);

  return resource;
}

export function getResource(name: string): Resource | undefined {
  return getResourceRegistry().get(name);
}
