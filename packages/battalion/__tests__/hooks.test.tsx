import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { z } from 'zod';

import { defineResource, getResourceRegistry, resetQueryGraph, useResource } from '../src';

global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Battalion Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({ json: () => Promise.resolve([]) });
    getResourceRegistry().clear();
    resetQueryGraph();
  });

  describe('useResource', () => {
    it('should return resource data and actions', async () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string(), title: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      const { result } = renderHook(() => useResource('Page'), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual([]);
      expect(typeof result.current.create).toBe('function');
      expect(typeof result.current.update).toBe('function');
      expect(typeof result.current.delete).toBe('function');
      expect(typeof result.current.batch).toBe('function');
    });

    it('should handle resource not found', () => {
      expect(() => {
        renderHook(() => useResource('NonExistent'), { wrapper: createWrapper() });
      }).toThrow("Resource 'NonExistent' not found");
    });

    it('should return transaction state', async () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
        transactions: { create: 'create_page', resourceType: 'page' },
      });

      const { result } = renderHook(() => useResource('Page'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.transactions.pending).toBe(0);
      expect(result.current.transactions.hasPending).toBe(false);
    });

    it('should return error and sync states', async () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
        liveSync: { enabled: false, strategy: 'polling' },
      });

      const { result } = renderHook(() => useResource('Page'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.errors.lastError).toBeNull();
      expect(result.current.sync.isConnected).toBe(false);
    });
  });
});
