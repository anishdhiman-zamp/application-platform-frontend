import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { z } from 'zod';

import { defineResource, defineView, getResourceRegistry, getViewRegistry, useResource, useView } from '../src';

// Mock fetch
global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Battalion Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve([]),
    });

    // Clear registries before each test
    const resourceRegistry = getResourceRegistry();
    const viewRegistry = getViewRegistry();
    resourceRegistry.clear();
    viewRegistry.clear();
  });

  describe('useResource', () => {
    it('should return resource data and actions', async () => {
      defineResource({
        name: 'Page',
        schema: z.object({
          id: z.string(),
          title: z.string(),
        }),
        endpoints: {
          list: '/api/pages',
          create: '/api/pages',
        },
      });

      const { result } = renderHook(() => useResource('Page'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(typeof result.current.create).toBe('function');
      expect(typeof result.current.update).toBe('function');
      expect(typeof result.current.delete).toBe('function');
    });

    it('should handle resource not found', () => {
      expect(() => {
        renderHook(() => useResource('NonExistentResource'), {
          wrapper: createWrapper(),
        });
      }).toThrow("Resource 'NonExistentResource' not found");
    });
  });

  describe('useView', () => {
    it('should return view data and actions', () => {
      defineResource({
        name: 'Page',
        schema: z.object({
          id: z.string(),
          title: z.string(),
        }),
        endpoints: {
          list: '/api/pages',
        },
      });

      defineView({
        name: 'Dashboard',
        uses: [{ entity: 'Page', alias: 'pages' }],
      });

      const { result } = renderHook(() => useView('Dashboard'), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.actions).toBeDefined();
      expect(result.current.uiState).toBeDefined();
      expect(typeof result.current.actions.createPage).toBe('function');
    });

    it('should handle view not found', () => {
      expect(() => {
        renderHook(() => useView('NonExistentView'), {
          wrapper: createWrapper(),
        });
      }).toThrow("View 'NonExistentView' not found");
    });
  });
});
