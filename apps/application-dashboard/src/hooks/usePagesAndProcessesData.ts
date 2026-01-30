'use client';

import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';

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
    isSuccess: isSuccessProcesses,
  } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  return {
    pages,
    processes,
    isLoadingPages,
    isLoadingProcesses,
    isSuccessPages,
    isSuccessProcesses,
    isLoading: isLoadingPages || isLoadingProcesses,
  };
};
