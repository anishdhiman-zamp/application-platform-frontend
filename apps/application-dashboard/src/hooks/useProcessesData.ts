'use client';

import { useResource } from '@zamp-platform/battalion';
import type { Process } from '@/app/(authenticated)/resources';

/**
 * Hook that only fetches processes data.
 * Does not handle navigation logic - use useProcessesNavigation for that.
 *
 * This is used by ProcessesProvider to fetch data once at the layout level.
 */
export const useProcessesData = () => {
  const {
    data: processes,
    isLoading: isLoadingProcesses,
    update: updateProcess,
    delete: deleteProcess,
  } = useResource<Process>('Process');

  return {
    processes,
    isLoadingProcesses,
    isSuccessProcesses: processes !== undefined,
    updateProcess,
    deleteProcess,
  };
};
