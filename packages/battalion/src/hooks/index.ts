import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createOrchestrator } from '../core/orchestrator';
import { getResourceRegistry } from '../core/registry';
import { getViewRegistry } from '../core/view-registry';
import { ResourceHookReturn, ResourceName, ResourceOptions, ViewHookReturn, ViewName, ViewOptions } from '../types';

/**
 * Hook for using a resource directly
 */
export function useResource<T>(resourceName: ResourceName, options?: ResourceOptions): ResourceHookReturn<T> {
  const queryClient = useQueryClient();
  const resourceRegistry = getResourceRegistry();
  const resource = resourceRegistry.get(resourceName);

  if (!resource) {
    throw new Error(`Resource '${resourceName}' not found`);
  }

  // List query
  const listQuery = useQuery({
    queryKey: [resourceName],
    queryFn: () => resource.api.list(),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime || resource.behaviors.cache?.staleTime,
    gcTime: options?.gcTime || resource.behaviors.cache?.gcTime,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<T>) => resource.api.create(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [resourceName] });

      // Snapshot previous value
      const previous = queryClient.getQueryData([resourceName]);

      // Optimistically update
      if (resource.behaviors.optimistic?.create) {
        queryClient.setQueryData([resourceName], (old: T[] = []) => {
          const optimisticData = { ...newData, id: `temp-${Date.now()}` } as T;
          if (resource.behaviors.optimistic?.create === 'append') {
            return [...old, optimisticData];
          }
          if (resource.behaviors.optimistic?.create === 'prepend') {
            return [optimisticData, ...old];
          }
          return old;
        });
      }

      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData([resourceName], context.previous);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => resource.api.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [resourceName] });

      const previous = queryClient.getQueryData([resourceName]);

      if (resource.behaviors.optimistic?.update) {
        queryClient.setQueryData([resourceName], (old: T[] = []) => {
          if (resource.behaviors.optimistic?.update === 'merge') {
            return old.map((item) => {
              const itemWithId = item as T & { id?: string };
              return itemWithId.id === id ? { ...item, ...data } : item;
            });
          }
          if (resource.behaviors.optimistic?.update === 'replace') {
            return old.map((item) => {
              const itemWithId = item as T & { id?: string };
              return itemWithId.id === id ? ({ ...item, ...data } as T) : item;
            });
          }
          return old;
        });
      }

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([resourceName], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => resource.api.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [resourceName] });

      const previous = queryClient.getQueryData([resourceName]);

      if (resource.behaviors.optimistic?.delete) {
        queryClient.setQueryData([resourceName], (old: T[] = []) => {
          if (resource.behaviors.optimistic?.delete === 'remove') {
            return old.filter((item) => {
              const itemWithId = item as T & { id?: string };
              return itemWithId.id !== id;
            });
          }
          if (resource.behaviors.optimistic?.delete === 'hide') {
            return old.map((item) => {
              const itemWithId = item as T & { id?: string };
              return itemWithId.id === id ? { ...item, _deleted: true } : item;
            });
          }
          return old;
        });
      }

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData([resourceName], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
  });

  return {
    data: listQuery.data as T[] | undefined,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    create: createMutation.mutate,
    update: (id: string, data: Partial<T>) => updateMutation.mutate({ id, data }),
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for using a view with multiple resources
 */
export function useView(viewName: ViewName, options?: ViewOptions): ViewHookReturn {
  const queryClient = options?.queryClient || useQueryClient();
  const viewRegistry = getViewRegistry();
  const view = viewRegistry.get(viewName);

  if (!view) {
    throw new Error(`View '${viewName}' not found`);
  }

  // Create orchestrator instance
  const orchestrator = createOrchestrator(queryClient);

  // Run the view
  const result = orchestrator.runView(viewName);

  return result;
}

/**
 * Hook for getting meta state information
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMetaState(_viewName?: ViewName) {
  const queryClient = useQueryClient();

  // Get all active queries
  const queries = queryClient.getQueriesData({});

  interface QueryState {
    isLoading?: boolean;
    isError?: boolean;
    isStale?: boolean;
    error?: Error;
  }

  const metaState = {
    isLoading: queries.some(([, query]) => (query as QueryState)?.isLoading),
    hasError: queries.some(([, query]) => (query as QueryState)?.isError),
    isStale: queries.some(([, query]) => (query as QueryState)?.isStale),
    isOptimistic: false, // This would be determined by mutation state
    errors: queries
      .filter(([, query]) => (query as QueryState)?.isError)
      .map(([, query]) => (query as QueryState)?.error)
      .filter((error): error is Error => error !== undefined),
  };

  return metaState;
}
