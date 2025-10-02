import { useInfiniteQuery } from '@tanstack/react-query';
import { SortingState } from '@tanstack/react-table';

interface UseTanStackClientSideDataProps {
  fetchPage: (args: {
    pageIndex: number;
    pageSize: number;
    sorting: { id: string; desc: boolean }[];
    filterModel: Record<string, SortingState>;
  }) => Promise<{ data: unknown[]; totalCount: number }>;
  sorting: SortingState;
  filterModel?: Record<string, SortingState>;
  queryKey: ReadonlyArray<string | number>;
  pageSize?: number;
}

export const useTanStackClientSideData = ({
  fetchPage,
  sorting,
  filterModel = {},
  queryKey,
  pageSize = 100,
}: UseTanStackClientSideDataProps) => {
  const finalQueryKey = [...queryKey, sorting, filterModel];

  return useInfiniteQuery({
    queryKey: finalQueryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const pageIndex = pageParam;
      const { data, totalCount } = await fetchPage({
        pageIndex,
        pageSize,
        sorting: sorting,
        filterModel,
      });

      return { data, totalCount };
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnMount: true, // avoid unnecessary refetch on mount (show cached data instead)
    refetchOnWindowFocus: false, // avoid unnecessary refetch when window is re-focused
    refetchOnReconnect: false, // Don't refetch when reconnecting to internet
    staleTime: 1000 * 1 * 1, // Keep data fresh for 1 second, when we switch pages, we will refetch (since tables are mounted, api call won't happen every 1 second on tab switch)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes (longer than staleTime)
    enabled: !!fetchPage, // serial queries are enabled
  });
};
