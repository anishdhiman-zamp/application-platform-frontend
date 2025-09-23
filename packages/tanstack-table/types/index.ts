/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef, ColumnOrderState, SortingState, Table, VisibilityState } from '@tanstack/react-table';
import { MutableRefObject } from 'react';

import { ActivityRunRowData } from '@/modules/process/process.types';
import { defaultFnType, MapAny } from '@/types/commonTypes';

// Sort direction enum for better type safety
export const enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export const enum CUSTOM_COLUMN_TYPE {
  STATUS = 'status',
  DOCUMENT = 'document',
  CURRENT_STATUS = 'current_status',
}

export const enum CUSTOM_HEADER_NAME {
  CURRENT_STATUS = 'Current Status',
}

export interface ColumnListingTkProps {
  table: Table<any>; // Direct TanStack table instance
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  onClose: defaultFnType;
  datasetId: string;
  isSelfServe?: boolean;
  position?: 'left' | 'right';
}

export interface TanStackClientSideDatasourceProps {
  getRows: (params: {
    startRow: number;
    endRow: number;
    sortModel: Array<{ colId: string; sort: SortDirection }>;
    filterModel: MapAny;
    request: TanStackClientSideRequestProps;
    success: (result: { rowData: any[]; rowCount: number }) => void;
    fail: () => void;
    api?: any;
  }) => void;
}

export interface TanStackClientSideRequestProps {
  startRow: number;
  endRow: number;
  sortModel: Array<{ colId: string; sort: SortDirection }>;
  filterModel: MapAny;
  rowGroupCols: Array<{ id: string; field?: string }>;
  valueCols: Array<{ id: string; aggFunc?: string; displayName?: string }>;
  pivotCols: never[];
  pivotMode: boolean;
  groupKeys: never[];
}

export interface VirtualizationOptions {
  overscan?: number; // Number of items to render outside viewport
  estimateSize?: number; // Estimated row height in pixels
  measureElement?: boolean; // Whether to measure actual element sizes
}

export interface TanStackTableProps {
  columns: ColumnDef<any>[];
  clientSideDatasource?: TanStackClientSideDatasourceProps; // Accept AG-Grid IServerSideDatasource as well
  totalRows?: number;
  filterModel?: MapAny;
  tableRef?: MutableRefObject<Table<any> | null>; // Pure TanStack table ref
  onTableReady?: (table: Table<any>) => void; // Callback when table is ready
  queryKeyParts?: ReadonlyArray<string | number>;
  onCellDoubleClicked?: (data: any) => void;
  rows?: MapAny[];
  onColumnVisible?: (columnId: string, visible: boolean) => void;
  onColumnMoved?: (columnId: string, fromIndex: number, toIndex: number) => void;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  onRowClicked?: (data: ActivityRunRowData, rowIndex?: number) => void;
  customTheme?: string;
  headerClass?: string;
  cellClass?: string;
  onGridReady?: () => void;
  showStatusBar?: boolean;
  onCellClicked?: (data: any) => void;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnOrder?: ColumnOrderState;
  isTabChange?: boolean; // Track if this is a tab change vs filter change
  emptyStateStatus?: string; // Status for empty state component
  virtualizationOptions?: VirtualizationOptions;
}
