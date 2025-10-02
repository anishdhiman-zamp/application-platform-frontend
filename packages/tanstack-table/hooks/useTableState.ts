import { ColumnOrderState, OnChangeFn, SortingState, VisibilityState } from '@tanstack/react-table';
import { useCallback, useRef, useState } from 'react';

import { MapAny } from '@/types/commonTypes';

interface UseTableStateProps {
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnOrder?: ColumnOrderState;
  initialFilterModel?: MapAny;
}

interface UseTableStateReturn {
  // State
  sorting: SortingState;
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  internalFilterModel: MapAny;

  // TanStack Table compatible setters
  setSorting: OnChangeFn<SortingState>;
  setColumnOrder: OnChangeFn<ColumnOrderState>;
  setColumnVisibility: OnChangeFn<VisibilityState>;
  setInternalFilterModel: (filter: MapAny) => void;

  // Internal direct setters (for sync hooks)
  setInternalSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  setInternalColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  setInternalColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;

  // Refs for complex state tracking
  isExternalOrderChangeRef: React.RefObject<boolean>;
  prevVisibilityRef: React.RefObject<Record<string, boolean>>;
}

export const useTableState = ({
  initialSorting = [],
  initialColumnVisibility = {},
  initialColumnOrder = [],
  initialFilterModel = {},
}: UseTableStateProps): UseTableStateReturn => {
  // Core table state
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [internalFilterModel, setInternalFilterModel] = useState<MapAny>(initialFilterModel);

  // Refs for tracking complex state changes
  const isExternalOrderChangeRef = useRef<boolean>(false);
  const prevVisibilityRef = useRef<Record<string, boolean>>({});

  // TanStack Table compatible handlers
  const handleSortingChange: OnChangeFn<SortingState> = useCallback((updater) => {
    setSorting((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = useCallback((updater) => {
    setColumnOrder((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback((updater) => {
    setColumnVisibility((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  return {
    // State
    sorting,
    columnOrder,
    columnVisibility,
    internalFilterModel,

    // TanStack Table compatible setters
    setSorting: handleSortingChange,
    setColumnOrder: handleColumnOrderChange,
    setColumnVisibility: handleColumnVisibilityChange,
    setInternalFilterModel,

    // Internal direct setters (for sync hooks)
    setInternalSorting: setSorting,
    setInternalColumnOrder: setColumnOrder,
    setInternalColumnVisibility: setColumnVisibility,

    // Refs
    isExternalOrderChangeRef,
    prevVisibilityRef,
  };
};
