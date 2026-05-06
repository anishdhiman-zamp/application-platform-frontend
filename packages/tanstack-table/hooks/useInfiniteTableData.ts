import { SortingState } from '@tanstack/react-table';
import { type MapAny } from '@zamp-platform/utils';
import { useMemo } from 'react';

import { flattenRowData } from '../utils';
import { useTanStackClientSideData } from './useTanstackClientSideData';

interface UseInfiniteTableDataProps<TData = unknown> {
  fetchPage: (args: {
    pageIndex: number;
    pageSize: number;
    sorting: { id: string; desc: boolean }[];
    filterModel: Record<string, SortingState>;
  }) => Promise<{ data: TData[]; totalCount: number }>;
  sorting: SortingState;
  filterModel: MapAny;
  queryKey: ReadonlyArray<string | number>;
  rows?: TData[];
  totalRows?: number;
  pageSize?: number;
}

interface UseInfiniteTableDataReturn<TData = unknown> {
  data: unknown; // Keep as unknown since it comes from TanStack Query
  flatRowData: TData[];
  totalFetched: number;
  totalRowCount: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing infinite table data with TanStack Query
 * Handles data fetching, flattening, and provides loading states
 */
export const useInfiniteTableData = <TData = unknown>({
  fetchPage,
  sorting,
  filterModel,
  queryKey,
  rows,
  totalRows,
  pageSize = 100,
}: UseInfiniteTableDataProps<TData>): UseInfiniteTableDataReturn<TData> => {
  // Use the existing useTanStackClientSideData hook
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError, error } =
    useTanStackClientSideData({
      fetchPage,
      sorting,
      filterModel,
      queryKey,
      pageSize,
    });

  // Flatten the paginated data
  const flatRowData = useMemo(() => flattenRowData<TData>(data as MapAny, rows), [data, rows]);

  // Calculate data metrics
  const totalFetched = flatRowData?.length ?? 0;
  const totalRowCount = (data?.pages?.[0] as { totalCount?: number })?.totalCount ?? totalRows ?? 0;

  return {
    data,
    flatRowData,
    totalFetched,
    totalRowCount,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  };
};
