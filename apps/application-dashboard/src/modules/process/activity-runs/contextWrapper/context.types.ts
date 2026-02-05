import { ColumnOrderState, ColumnSizingState, VisibilityState } from '@zamp-platform/tanstack-table';

export interface DisplayOptionContextProps {
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  columnSizing: ColumnSizingState;
  setColumnSizing: (sizing: ColumnSizingState) => void;
}

export interface DisplayOptionProviderProps {
  initialVisibility: VisibilityState;
  initialOrder: ColumnOrderState;
  initialSizing?: ColumnSizingState;
  processId: string;
}
