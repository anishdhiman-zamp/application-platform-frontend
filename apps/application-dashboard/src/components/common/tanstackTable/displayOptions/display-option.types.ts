import { ColumnOrderState, Table, VisibilityState } from '@zamp-platform/tanstack-table';
import { POSITION } from '@/constants/common.constants';
import { defaultFnType, MapAny } from '@/types/commonTypes';

export interface ColumnListingTkProps {
  table: Table<MapAny> | null; // Direct TanStack table instance
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  onClose: defaultFnType;
  datasetId: string;
  isSelfServe?: boolean;
  position?: POSITION.LEFT | POSITION.RIGHT;
}
