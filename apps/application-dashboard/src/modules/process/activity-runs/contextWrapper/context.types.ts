import { ColumnOrderState, VisibilityState } from '@zamp-platform/tanstack-table';

export interface DisplayOptionContextProps {
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
}

export interface DisplayOptionProviderProps {
  initialVisibility: VisibilityState;
  initialOrder: ColumnOrderState;
  processId: string;
}
