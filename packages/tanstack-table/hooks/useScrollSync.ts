import { useCallback, useRef } from 'react';

interface UseScrollSyncProps {
  onBodyScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

interface UseScrollSyncReturn {
  headerContainerRef: React.RefObject<HTMLDivElement | null>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  handleHeaderScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleBodyScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Custom hook for synchronizing scroll between header and body containers
 * Commonly used in tables where header and body need to scroll together horizontally
 */
export const useScrollSync = ({ onBodyScroll }: UseScrollSyncProps = {}): UseScrollSyncReturn => {
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Header scroll handler - syncs body scroll with header scroll
  const handleHeaderScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Body scroll handler - syncs header scroll with body scroll
  const handleBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      // Call any additional body scroll handler (e.g., infinite scroll)
      if (onBodyScroll) {
        onBodyScroll(e);
      }

      // Sync header scroll with body scroll
      if (headerContainerRef.current) {
        headerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    },
    [onBodyScroll],
  );

  return {
    headerContainerRef,
    tableContainerRef,
    handleHeaderScroll,
    handleBodyScroll,
  };
};
