import { useMemo } from 'react';

interface UseSkeletonStatesProps {
  isFetching: boolean;
  isFetchingNextPage: boolean;
  totalFetched: number;
  totalRowCount: number;
  fetchMoreSkeletonCount?: number;
}

interface UseSkeletonStatesReturn {
  showFetchMoreSkeleton: boolean;
  showOverlaySkeleton: boolean;
  skeletonRowCount: number;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
}

/**
 * Custom hook for managing skeleton loading states in tables
 * Determines when to show different types of loading indicators
 */
export const useSkeletonStates = ({
  isFetching,
  isFetchingNextPage,
  totalFetched,
  totalRowCount,
  fetchMoreSkeletonCount = 10,
}: UseSkeletonStatesProps): UseSkeletonStatesReturn => {
  const skeletonStates = useMemo(() => {
    // Show skeleton rows at bottom when fetching more data
    const showFetchMoreSkeleton = isFetchingNextPage && totalFetched > 0 && totalFetched < totalRowCount;

    // Show overlay skeleton for initial load and filter/sort operations
    const showOverlaySkeleton = isFetching && !isFetchingNextPage && totalFetched === 0;

    // Calculate skeleton row count
    const skeletonRowCount = showFetchMoreSkeleton ? fetchMoreSkeletonCount : 0;

    // Additional loading states for convenience
    const isLoadingInitial = isFetching && totalFetched === 0;
    const isLoadingMore = isFetchingNextPage && totalFetched > 0;

    return {
      showFetchMoreSkeleton,
      showOverlaySkeleton,
      skeletonRowCount,
      isLoadingInitial,
      isLoadingMore,
    };
  }, [isFetching, isFetchingNextPage, totalFetched, totalRowCount, fetchMoreSkeletonCount]);

  return skeletonStates;
};
