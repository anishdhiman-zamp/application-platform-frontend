import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { useEffect } from 'react';

import { MapAny } from '@/types/commonTypes';

interface UseTableSyncProps {
  // External props to sync with
  filterModel?: MapAny;
  initialColumnVisibility: VisibilityState;
  initialColumnOrder: ColumnOrderState;

  // Internal state setters
  setInternalFilterModel: (filter: MapAny) => void;
  setInternalColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  setInternalColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;

  // Refs for tracking state
  isExternalOrderChangeRef: React.RefObject<boolean>;
  isDragOperationRef?: React.RefObject<boolean>;
}

export const useTableSync = ({
  filterModel,
  initialColumnVisibility,
  initialColumnOrder,
  setInternalFilterModel,
  setInternalColumnVisibility,
  setInternalColumnOrder,
  isExternalOrderChangeRef,
  isDragOperationRef,
}: UseTableSyncProps): void => {
  /**
   * Sync internal filter state with external filterModel prop
   * Keeps internal state in sync when parent component updates filters
   */
  useEffect(() => {
    setInternalFilterModel(filterModel ?? {});
  }, [filterModel, setInternalFilterModel]);

  /**
   * Sync column visibility with external initial configuration
   * Only applies when external config has actual values
   */
  useEffect(() => {
    if (Object.keys(initialColumnVisibility)?.length > 0) {
      setInternalColumnVisibility(initialColumnVisibility);
    }
  }, [initialColumnVisibility, setInternalColumnVisibility]);

  /**
   * Sync column order with external initial configuration
   * Prevents sync during drag operations or external order changes
   */
  useEffect(() => {
    const shouldSyncOrder =
      initialColumnOrder?.length > 0 &&
      !isExternalOrderChangeRef.current &&
      (!isDragOperationRef || !isDragOperationRef.current);

    if (shouldSyncOrder) {
      setInternalColumnOrder(initialColumnOrder);
    }
  }, [initialColumnOrder, setInternalColumnOrder, isExternalOrderChangeRef, isDragOperationRef]);
};
