/**
 * Process Resource Definition
 *
 * Defines the Process resource using Battalion's defineResource.
 */

import { defineResource } from '@zamp-platform/battalion';
import { toast } from '@zamp-platform/ui';
import { EVENT_TYPE } from '@zamp-platform/utils';
import { z } from 'zod';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { getAndRemoveProcessAudiences, shareProcessWithAudiences } from '@/modules/process/create/utils/audience';
import { ProcessesResponseType, ProcessStatus } from '@/types/api/processApi.types';
import { dispatchProcessCreated, navigateTo } from '@/utils/events';

const ProcessSchema = z.object({
  process_id: z.string(),
  display_name: z.string(),
  status: z.nativeEnum(ProcessStatus),
});

export type Process = z.infer<typeof ProcessSchema>;

/**
 * Process Resource
 *
 * Features:
 * - Live sync with SSE (listens to PROCESS events via global EventBus)
 * - IndexedDB persistence for instant loading
 * - Optimistic updates for all mutations
 *
 * Transaction Types:
 * - CreateProcessControllerWorkflow: Create a new process
 * - UpdateProcessNameControllerWorkflow: Update process name
 * - DeleteProcessControllerWorkflow: Delete a process
 */
export const ProcessResource = defineResource({
  name: 'Process',
  schema: ProcessSchema,
  endpoints: {
    list: 'processes/summary',
  },
  transformResponse: (response: unknown) => (response as ProcessesResponseType).processes,
  transactions: {
    create: 'CreateProcessControllerWorkflow',
    update: 'UpdateProcessControllerWorkflow',
    delete: 'DeleteProcessControllerWorkflow',
    resourceType: 'process',
    idField: 'process_id',
    transformPayload: {
      create: (data: unknown) => {
        const processData = data as Partial<Process>;

        return {
          process_id: processData.process_id,
          name: processData.display_name,
          status: processData.status || ProcessStatus.DRAFT,
        };
      },
      update: (data: unknown) => {
        const processData = data as Partial<Process>;

        return {
          process_id: processData.process_id,
          name: processData.display_name,
        };
      },
      delete: (data: unknown) => {
        const processData = data as { process_id?: string };

        return {
          process_id: processData.process_id,
        };
      },
    },
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',

      /**
       * Creates a full Process object for optimistic updates.
       */
      getOptimisticItem: (data: Partial<Process>): Process => ({
        process_id: data.process_id || `temp-${Date.now()}`,
        display_name: data.display_name || '',
        status: data.status || ProcessStatus.DRAFT,
      }),
    },
    onSuccess: {
      create: (data) => {
        const response = data as {
          status?: string;
          transactions?: Array<{ failure: unknown; output_payload?: { id?: string } }>;
        };

        const processId = (response?.transactions?.[0]?.output_payload?.id as string) ?? '';

        // Get audiences from temporary storage
        const audiences = getAndRemoveProcessAudiences(processId);

        // Share process with audiences if provided
        if (audiences && audiences.length > 0) {
          shareProcessWithAudiences(processId, audiences);
        }

        // Dispatch event to notify components that process was created
        dispatchProcessCreated(processId);
      },
    },
    onRollback: {
      create: () => {
        toast.error('Failed to create process. Please try again.');
        navigateTo(ROUTES_PATH.PROCESS_CREATE, { replace: true });
      },
      update: () => {
        toast.error('Failed to update process. Please try again.');
      },
      delete: () => {
        toast.error('Failed to delete process. Please try again.');
      },
    },
  },

  /**
   * Live Sync Configuration
   * - SSE strategy using global EventBus
   * - Listens for PROCESS events to trigger refetch
   */
  liveSync: {
    enabled: true,
    strategy: 'sse',
    sseConfig: {
      event: EVENT_TYPE.PROCESS,
    },
  },
  /**
   * Persistence Configuration
   * - IndexedDB storage (default) for instant loading on revisit
   * - 24 hour max age for cached data
   */
  persist: true, // Uses IndexedDB with default 24h maxAge
  cache: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
});
