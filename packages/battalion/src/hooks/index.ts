import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLiveSyncManager, LiveSyncConfig as LiveSyncManagerConfig } from '../core/live-sync';
import { getQueryGraph } from '../core/query-graph';
import { getResourceRegistry } from '../core/registry';
import { transactionStore } from '../transactions/store';
import {
  BatchOperation,
  ErrorState,
  FailedTransaction,
  LiveSyncState,
  ResourceHookReturn,
  ResourceName,
  ResourceOptions,
  TransactionState,
} from '../types';

export function useResource<T>(resourceName: ResourceName, options?: ResourceOptions): ResourceHookReturn<T> {
  const defaultQueryClient = useQueryClient();
  const queryClient = options?.queryClient || defaultQueryClient;
  const resource = getResourceRegistry().get(resourceName);
  const integration = transactionStore.getIntegration();
  const queryGraph = getQueryGraph();
  const liveSyncManager = getLiveSyncManager();

  const [errorState, setErrorState] = useState<ErrorState>({
    lastError: null,
    failedTransactions: [],
  });

  const [syncState, setSyncState] = useState<LiveSyncState>({
    isConnected: false,
    lastSyncAt: null,
  });

  if (!resource) {
    throw new Error(`Resource '${resourceName}' not found`);
  }

  useEffect(() => {
    if (resource.liveSync?.enabled) {
      liveSyncManager.setQueryClient(queryClient);
      liveSyncManager.subscribe(resourceName, resource.liveSync as LiveSyncManagerConfig, () => {
        setSyncState(liveSyncManager.getState(resourceName));
      });
      return () => liveSyncManager.unsubscribe(resourceName);
    }
  }, [resourceName, resource.liveSync, queryClient, liveSyncManager]);

  const optimisticConfig = useMemo(() => resource.transactions?.optimistic, [resource]);

  // Get the ID field name (defaults to 'id')
  const idField = useMemo(() => resource.transactions?.idField || 'id', [resource]);

  // Helper to get ID from an item
  const getItemId = useCallback(
    (item: T): string | undefined => {
      return (item as Record<string, unknown>)[idField] as string | undefined;
    },
    [idField],
  );

  // Get the function to create optimistic items
  const getOptimisticItem = useMemo(
    () => optimisticConfig?.getOptimisticItem as ((data: Partial<T>) => T) | undefined,
    [optimisticConfig],
  );

  const listQuery = useQuery({
    queryKey: [resourceName],
    queryFn: () => resource.api.list(),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime || resource.cache?.staleTime,
    gcTime: options?.gcTime || resource.cache?.gcTime,
  });

  const handleRollback = useCallback(
    (action: 'create' | 'update' | 'delete', data: unknown, id: string | undefined, error: Error) => {
      const failedTx: FailedTransaction = {
        id: id || `temp-${Date.now()}`,
        action,
        data,
        error,
        timestamp: new Date(),
        resourceName,
      };
      setErrorState((prev) => ({
        lastError: error,
        failedTransactions: [...prev.failedTransactions, failedTx],
      }));

      const handler = resource.transactions?.onRollback?.[action];
      if (handler) {
        if (action === 'create') (handler as (d: unknown, e: Error) => void)(data, error);
        else if (action === 'update' && id) (handler as (i: string, d: unknown, e: Error) => void)(id, data, error);
        else if (action === 'delete' && id) (handler as (i: string, e: Error) => void)(id, error);
      }
    },
    [resourceName, resource.transactions?.onRollback],
  );

  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      if (integration?.shouldUseTransactions(resourceName, 'create')) {
        // Fire and forget - don't await response
        integration.createTransactionRequest(resourceName, 'create', data);
      }
      // Return optimistic item if getOptimisticItem is defined, otherwise partial data
      return getOptimisticItem ? getOptimisticItem(data) : ({ ...data, [idField]: `temp-${Date.now()}` } as T);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [resourceName] });
      const previous = queryClient.getQueryData([resourceName]);
      if (optimisticConfig?.create) {
        queryClient.setQueryData([resourceName], (old: T[] = []) => {
          // Use getOptimisticItem if defined, otherwise fallback to spreading data
          const item = getOptimisticItem
            ? getOptimisticItem(newData)
            : ({ ...newData, [idField]: `temp-${Date.now()}` } as T);
          return optimisticConfig.create === 'prepend' ? [item, ...old] : [...old, item];
        });
      }
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) queryClient.setQueryData([resourceName], context.previous);
      handleRollback('create', newData, undefined, err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      if (integration?.shouldUseTransactions(resourceName, 'update')) {
        integration.createTransactionRequest(resourceName, 'update', { [idField]: id, ...data });
      }
      return { [idField]: id, ...data } as T;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [resourceName] });
      const previous = queryClient.getQueryData([resourceName]);
      if (optimisticConfig?.update) {
        queryClient.setQueryData([resourceName], (old: T[] = []) =>
          old.map((item) => (getItemId(item) === id ? { ...item, ...data } : item)),
        );
      }
      return { previous };
    },
    onError: (err, { id, data }, context) => {
      if (context?.previous) queryClient.setQueryData([resourceName], context.previous);
      handleRollback('update', data, id, err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (integration?.shouldUseTransactions(resourceName, 'delete')) {
        integration.createTransactionRequest(resourceName, 'delete', { [idField]: id });
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [resourceName] });
      const previous = queryClient.getQueryData([resourceName]);
      if (optimisticConfig?.delete === 'remove') {
        queryClient.setQueryData([resourceName], (old: T[] = []) => old.filter((item) => getItemId(item) !== id));
      } else if (optimisticConfig?.delete === 'hide') {
        queryClient.setQueryData([resourceName], (old: T[] = []) =>
          old.map((item) => (getItemId(item) === id ? { ...item, _deleted: true } : item)),
        );
      }
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) queryClient.setQueryData([resourceName], context.previous);
      handleRollback('delete', { [idField]: id }, id, err);
    },
  });

  const batch = useCallback(
    async (operations: BatchOperation[]) => {
      if (!integration) throw new Error('Transaction store not initialized');

      const transactions = operations.map((op) => ({
        resource: resourceName,
        action: op.action,
        data: op.data,
        options: op.id ? { resourceId: op.id } : undefined,
      }));

      // Fire and forget
      integration.createBatchTransactionRequest(transactions);

      // Apply optimistic updates
      for (const op of operations) {
        const opData = op.data as Partial<T>;
        if (op.action === 'create') {
          queryClient.setQueryData([resourceName], (old: T[] = []) => {
            const item = getOptimisticItem
              ? getOptimisticItem(opData)
              : ({ ...opData, [idField]: `temp-${Date.now()}` } as T);
            return optimisticConfig?.create === 'prepend' ? [item, ...old] : [...old, item];
          });
        } else if (op.action === 'update' && op.id) {
          queryClient.setQueryData([resourceName], (old: T[] = []) =>
            old.map((item) => (getItemId(item) === op.id ? { ...item, ...opData } : item)),
          );
        } else if (op.action === 'delete' && op.id) {
          queryClient.setQueryData([resourceName], (old: T[] = []) => old.filter((item) => getItemId(item) !== op.id));
        }
      }
    },
    [resourceName, integration, queryClient, optimisticConfig, getOptimisticItem, idField, getItemId],
  );

  // Transaction state from mutation states (actual pending operations)
  const transactionState: TransactionState = {
    pending:
      (createMutation.isPending ? 1 : 0) + (updateMutation.isPending ? 1 : 0) + (deleteMutation.isPending ? 1 : 0),
    pendingIds: [],
    hasPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    retrying: 0,
    failed: errorState.failedTransactions.length,
  };

  return {
    data: listQuery.data as T[] | undefined,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isStale: listQuery.isStale,
    error: listQuery.error,
    create: createMutation.mutate,
    update: (id: string, data: Partial<T>) => updateMutation.mutate({ id, data }),
    delete: deleteMutation.mutate,
    batch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getDependency: <D>(name: string) => queryGraph.getDependencyData(name) as D | undefined,
    sync: syncState,
    transactions: transactionState,
    errors: errorState,
    refetch: () => queryClient.refetchQueries({ queryKey: [resourceName] }),
    invalidate: () => queryClient.invalidateQueries({ queryKey: [resourceName] }),
  };
}

export function useMetaState(resourceName?: ResourceName) {
  const queryGraph = getQueryGraph();

  if (resourceName) {
    const node = queryGraph.getNode(resourceName);
    if (node) {
      return {
        isLoading: node.state === 'fetching',
        hasError: node.state === 'error',
        isStale: false,
        isOptimistic: false,
        errors: node.error ? [node.error] : [],
      };
    }
  }

  const state = queryGraph.getAggregateState();
  return {
    isLoading: state.isLoading,
    hasError: state.hasError,
    isStale: false,
    isOptimistic: false,
    errors: state.errors,
  };
}
