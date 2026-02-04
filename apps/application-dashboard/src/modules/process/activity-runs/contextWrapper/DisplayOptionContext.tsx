import React, { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { ColumnOrderState, ColumnSizingState, VisibilityState } from '@zamp-platform/tanstack-table';
import {
  DisplayOptionContextProps,
  DisplayOptionProviderProps,
} from 'modules/process/activity-runs/contextWrapper/context.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

const DisplayOptionContext = createContext<DisplayOptionContextProps | null>(null);

const DisplayOptionProvider: FC<PropsWithChildren<DisplayOptionProviderProps>> = ({
  children,
  initialVisibility,
  initialOrder,
  initialSizing = {},
  processId,
}) => {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialOrder);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(initialSizing);

  // Handle localStorage persistence when state actually changes
  useEffect(() => {
    // Skip if columnOrder is empty (initial state before sync)
    if (columnOrder.length === 0) return;

    // Persist to localStorage with processId as key in the correct format
    const storeData = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}') ?? {};

    // Convert to proper format with colId, isVisible, width
    const columnConfig = columnOrder.map((colId) => ({
      colId,
      isVisible: columnVisibility[colId] ?? true,
      width: columnSizing[colId] ?? 0,
    }));

    const updatedData = { ...storeData, [processId]: columnConfig };

    setToLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY, JSON.stringify(updatedData));
  }, [columnOrder, columnVisibility, columnSizing, processId]);

  const handleSetColumnVisibility = useCallback((visibility: VisibilityState) => {
    setColumnVisibility(visibility);
  }, []);

  const handleSetColumnOrder = useCallback((order: ColumnOrderState) => {
    setColumnOrder(order);
  }, []);

  const handleSetColumnSizing = useCallback((sizing: ColumnSizingState) => {
    setColumnSizing(sizing);
  }, []);

  const contextValue: DisplayOptionContextProps = {
    columnVisibility,
    setColumnVisibility: handleSetColumnVisibility,
    columnOrder,
    setColumnOrder: handleSetColumnOrder,
    columnSizing,
    setColumnSizing: handleSetColumnSizing,
  };

  return <DisplayOptionContext.Provider value={contextValue}>{children}</DisplayOptionContext.Provider>;
};

const useDisplayOptionContext = () => {
  const context = useContext(DisplayOptionContext);

  if (!context) {
    throw new Error('useDisplayOptionContext must be used within a DisplayOptionProvider');
  }

  return context;
};

export { DisplayOptionProvider, useDisplayOptionContext };
