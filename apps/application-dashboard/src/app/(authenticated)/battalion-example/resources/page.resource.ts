/**
 * Page Resource Definition
 *
 * Defines the Page resource using Battalion's defineResource.
 */

import { defineResource } from '@zamp-platform/battalion';
import { z } from 'zod';

// Schema matching PageResponseType from types/api/pagesApi.types.ts
const SheetSchema = z.object({
  sheet_id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  fractional_index: z.number(),
  page_id: z.string(),
});

const PageSchema = z.object({
  page_id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  fractional_index: z.number(),
  organization_id: z.string(),
  sheets: z.array(SheetSchema),
});

export type Page = z.infer<typeof PageSchema>;

/**
 * Page Resource
 *
 * Features:
 * - Live sync with polling (2 minute interval)
 * - OPFS persistence for instant loading
 * - Optimistic updates for all mutations
 */
export const PageResource = defineResource({
  name: 'Page',
  schema: PageSchema,
  endpoints: {
    list: 'pages/get-pages',
  },
  transactions: {
    create: 'create_page',
    update: 'update_page',
    delete: 'delete_page',
    resourceType: 'page',
    idField: 'page_id',
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',
      /**
       * Creates a full Page object for optimistic updates.
       */
      getOptimisticItem: (data: Partial<Page>): Page => ({
        page_id: data.page_id || `temp-${Date.now()}`,
        name: data.name || '',
        description: data.description || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        fractional_index: data.fractional_index || Date.now(),
        organization_id: data.organization_id || '',
        sheets: data.sheets || [],
      }),
    },
    onRollback: {
      create: (data, error) => {
        console.error('[Page] Create failed:', error.message, data);
      },
      update: (id, data, error) => {
        console.error(`[Page] Update failed for ${id}:`, error.message, data);
      },
      delete: (id, error) => {
        console.error(`[Page] Delete failed for ${id}:`, error.message);
      },
    },
  },
  /**
   * Live Sync Configuration
   * - Polling strategy with 2 minute interval
   * - OPFS persistence for instant loading on revisit
   */
  liveSync: {
    enabled: true,
    strategy: 'polling',
    interval: 120000, // 2 minutes
    persist: true, // Enable OPFS storage
    persistMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  cache: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
});
