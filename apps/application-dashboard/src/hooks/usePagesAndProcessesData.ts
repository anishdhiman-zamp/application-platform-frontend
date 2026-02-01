'use client';

import { useResource } from '@zamp-platform/battalion';
import { useGetPagesQuery } from '@/apis/pages';
import type { Process } from '@/app/(authenticated)/resources';

/**
 * Hook that only fetches pages and processes data.
 * Does not handle navigation logic - use usePagesAndProcessesNavigation for that.
 *
 * This is used by PagesAndProcessesProvider to fetch data once at the layout level.
 */
export const usePagesAndProcessesData = () => {
  // Fetch pages and processes data
  const {
    data: pages,
    isLoading: isLoadingPages,
    isSuccess: isSuccessPages,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const {
    data: processes,
    isLoading: isLoadingProcesses,
    update: updateProcess,
    delete: deleteProcess,
  } = useResource<Process>('Process');

  return {
    pages,
    processes,
    isLoadingPages,
    isLoadingProcesses,
    isSuccessPages,
    isSuccessProcesses: processes !== undefined,
    isLoading: isLoadingPages || isLoadingProcesses,
    updateProcess,
    deleteProcess,
  };
};
