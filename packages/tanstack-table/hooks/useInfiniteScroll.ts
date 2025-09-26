import { useCallback } from 'react';

interface UseInfiniteScrollProps {
  fetchNextPage: () => void;
  isFetching: boolean;
  totalFetched: number;
  totalRowCount: number;
  hasDataSource: boolean;
  threshold?: number; // Distance from bottom to trigger fetch (in pixels)
}

interface UseInfiniteScrollReturn {
  fetchMoreOnBottomReached: (containerRefElement?: HTMLDivElement | null) => void;
}

/**
 * Custom hook for handling infinite scroll functionality
 * Automatically fetches more data when user scrolls near the bottom
 */
export const useInfiniteScroll = ({
  fetchNextPage,
  isFetching,
  totalFetched,
  totalRowCount,
  hasDataSource,
  threshold = 500,
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement && hasDataSource) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        // Check if user has scrolled close to the bottom
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        if (distanceFromBottom < threshold && !isFetching && totalFetched < totalRowCount) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalRowCount, hasDataSource, threshold],
  );

  return {
    fetchMoreOnBottomReached,
  };
};
