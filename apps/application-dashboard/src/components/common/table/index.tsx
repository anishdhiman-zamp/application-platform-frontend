import { FC, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type CellClickedEvent,
  CellDoubleClickedEvent,
  CellEditRequestEvent,
  CellFocusedEvent,
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ColumnMovedEvent,
  ColumnVisibleEvent,
  CustomEditorModule,
  CustomFilterModule,
  DateFilterModule,
  EventApiModule,
  FillEndEvent,
  GetContextMenuItemsParams,
  type GetRowIdParams,
  GridReadyEvent,
  IServerSideDatasource,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  PaginationModule,
  RenderApiModule,
  RowApiModule,
  RowClickedEvent,
  RowDragEndEvent,
  RowDragModule,
  ScrollApiModule,
  SelectEditorModule,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  TextEditorModule,
  TextFilterModule,
  Theme,
  ValidationModule,
  type ValueFormatterParams,
} from 'ag-grid-community';
import {
  AdvancedFilterModule,
  CellSelectionModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  MultiFilterModule,
  RichSelectModule,
  RowGroupingPanelModule,
  ServerSideRowModelApiModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact, CustomStatusPanelProps } from 'ag-grid-react';
import { COLORS } from 'constants/colors';
import { MissingFieldItemType } from 'types/api/processApi.types';
import { MapAny } from 'types/commonTypes';
import { formatArrayValue } from '@/modules/data/data.utils';
import { N_A_VALUE } from '@/modules/process/process.constant';
import { isValueEmpty } from '@/modules/widgets/TreeTable/utils';
import { cn } from '@/utils/common';
import CustomContextMenuItem from 'components/common/table/CustomContextMenuItem';
import CustomGroupHeader from 'components/common/table/CustomHeader/CustomGroupHeader';
import CustomLoadingOverlay from 'components/common/table/CustomLoadingOverlay';
import CustomNoRowsOverlay from 'components/common/table/CustomNoRowsOverlay';
import CustomStatusBar from 'components/common/table/CustomStatusBar';
import LinkCellPopover from 'components/common/table/LinkCellPopover';
import {
  AggregationFunctionMap,
  cellSelectionConfig,
  myIcons,
  myTheme,
  PAGE_SIZE,
  sideBarConfig,
} from 'components/common/table/table.constants';
import { isCellValueUrl } from 'components/common/table/table.utils';

ModuleRegistry.registerModules([
  ScrollApiModule,
  ClientSideRowModelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ServerSideRowModelModule,
  ServerSideRowModelApiModule,
  SideBarModule,
  FiltersToolPanelModule,
  ColumnsToolPanelModule,
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ServerSideRowModelModule,
  AdvancedFilterModule,
  CustomFilterModule,
  RowGroupingPanelModule,
  StatusBarModule,
  CellSelectionModule,
  ColumnApiModule,
  TextEditorModule,
  CustomEditorModule,
  RichSelectModule,
  NumberEditorModule,
  RowApiModule,
  ColumnAutoSizeModule,
  EventApiModule,
  RowDragModule,
  SelectEditorModule,
  RenderApiModule,
  ValidationModule /* Development Only */,
  PaginationModule,
]);

interface TableProps {
  tableRef?: RefObject<AgGridReact | null>;
  rows?: MapAny[];
  columns: MapAny[];
  columnConfig?: ColDef;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  serverSideDatasource?: IServerSideDatasource;
  customTheme?: Theme;
  onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;
  showSideBar?: boolean;
  showStatusBar?: boolean;
  totalRows?: number;
  enableCellSelection?: boolean;
  suppressCellFocus?: boolean;
  onColumnVisible?: (event: ColumnVisibleEvent) => void;
  onCellEditRequest?: (event: CellEditRequestEvent) => void;
  onFillEnd?: (event: FillEndEvent) => void;
  onRowClicked?: (event: RowClickedEvent) => void;
  onDrilldownClick?: (data: MapAny) => void;
  onRowPropertiesClick?: (data: MapAny) => void;
  autoSizeStrategy?:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy;
  onColumnMoved?: (event: ColumnMovedEvent) => void;
  columnLevelStats?: MapAny;
  cellClass?: string;
  headerClass?: string;
  onGridReady?: (params: GridReadyEvent) => void;
  menuTitle?: string;
  enableRowDrag?: boolean;
  onRowDragEnd?: (event: RowDragEndEvent) => void;
  missingFields?: MissingFieldItemType[];
  completedFields?: { rowId: string; columnId: string }[];
  shouldShowNA?: boolean;
  suppressScrollOnNewData?: boolean;
  onCellClicked?: (event: CellClickedEvent) => void;
  useGetRowId?: boolean;
}

export type TableColumnType = {
  field: string;
  filter?: string | boolean | ((props: any) => ReactNode);
  filterParams?: {
    values: string[];
    filterOptions: string[] | null;
  };
  flex: number;
};

const Table: FC<TableProps> = ({
  tableRef,
  rows = [],
  columns,
  columnConfig,
  containerStyle = { width: '100%', height: '100%' },
  gridStyle = { height: 'calc(100vh - 100px)', width: '100%' },
  serverSideDatasource,
  customTheme,
  onCellDoubleClicked,
  showSideBar = false,
  showStatusBar = false,
  totalRows,
  enableCellSelection = false,
  suppressCellFocus = false,
  onColumnVisible,
  onCellEditRequest,
  onFillEnd,
  onRowClicked,
  onDrilldownClick,
  onRowPropertiesClick,
  autoSizeStrategy,
  onColumnMoved,
  columnLevelStats,
  cellClass,
  headerClass,
  onGridReady,
  menuTitle,
  enableRowDrag = false,
  onRowDragEnd,
  missingFields,
  completedFields,
  shouldShowNA = false,
  suppressScrollOnNewData,
  onCellClicked,
  useGetRowId = false,
}) => {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const doubleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [linkPopover, setLinkPopover] = useState<{ url: string; cellRect: DOMRect; gridRect: DOMRect } | null>(null);

  const checkIsMissingField = useCallback(
    (params: MapAny) => {
      return missingFields?.some(
        (field) => field?.id === params.node.data?.id && field?.column === params.column.getColId(),
      );
    },
    [missingFields],
  );

  const checkIsFieldCompleted = useCallback(
    (rowId: string, columnId: string) => {
      return completedFields?.some((field) => field?.rowId === rowId && field?.columnId === columnId);
    },
    [completedFields],
  );

  const getValueClass = (params: MapAny) => {
    if (isValueEmpty(params?.value) && checkIsMissingField(params ?? [])) {
      return '!text-RED_900 italic';
    }
    if (isValueEmpty(params?.value)) {
      return '!text-GRAY_500';
    }

    return '!text-GRAY_1000 normal';
  };

  const formatCellValue = useCallback(
    (params: ValueFormatterParams) => {
      const { value } = params;

      const isMissingField = checkIsMissingField(params);
      const isEmpty = isValueEmpty(value);

      // Handle missing required fields
      if (isMissingField && isEmpty) {
        return '*Required';
      }

      // Handle empty values with N/A display
      if (shouldShowNA && isEmpty) {
        return N_A_VALUE;
      }

      // Handle array values
      if (Array.isArray(value)) {
        return formatArrayValue(value);
      }

      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      // Return original value for all other cases
      return value?.toString();
    },
    [checkIsMissingField, shouldShowNA, isValueEmpty],
  );

  // @ts-ignore cellStyle is not typed
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      minWidth: 150,
      filter: 'agTextColumnFilter',
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true,
      valueFormatter: formatCellValue,
      floatingFilter: false,
      headerClass: cn('f-12-600 text-GRAY_1000', headerClass),
      cellClass: (params: MapAny) => {
        const baseClasses = 'f-11-400 content-center !px-2 py-1';
        const interactiveClass = onCellDoubleClicked || onRowClicked ? 'cursor-pointer' : '';
        const valueClass = getValueClass(params ?? []);
        const linkClass = isCellValueUrl(params?.value) ? '!text-BLUE_700 underline' : '';

        return cn(baseClasses, valueClass, interactiveClass, linkClass, cellClass);
      },
      cellClassRules: {
        'missing-focus': (params) => {
          const focused = params.api.getFocusedCell();

          return !!(
            focused &&
            focused.rowIndex === params.node.rowIndex &&
            focused.column.getColId() === params.column.getColId() &&
            checkIsMissingField(params ?? [])
          );
        },
        'missing-completed': (params) => {
          const isCompleted =
            !isValueEmpty(params?.value) &&
            checkIsFieldCompleted(params.node.data?.id, params.column.getColId()) &&
            checkIsMissingField(params ?? []);

          return isCompleted;
        },
      },
      allowedAggFuncs: Object.keys(AggregationFunctionMap),
      flex: 1,
      cellStyle: (params: MapAny) => {
        if (!params.node?.__hasChildren && params.node?.parent?.key) {
          return { backgroundColor: COLORS.BACKGROUND_GRAY_2 };
        }
        if (params.node?.__hasChildren) {
          return { border: 'none' };
        }

        return undefined;
      },
      ...columnConfig,
    };
  }, [columnConfig, missingFields, completedFields, shouldShowNA, isValueEmpty]);

  const icons = useMemo<MapAny>(() => {
    return myIcons;
  }, []);

  const sideBar = useMemo(() => (showSideBar ? sideBarConfig : null), [showSideBar]);

  const theme = useMemo<Theme | 'legacy'>(() => {
    return customTheme ?? myTheme;
  }, [customTheme]);

  const statusBar = useMemo(() => {
    return showStatusBar
      ? {
          statusPanels: [
            {
              statusPanel: (props: CustomStatusPanelProps) => (
                <CustomStatusBar {...props} totalRows={totalRows} columnLevelStats={columnLevelStats} />
              ),
            },
            { statusPanel: 'agAggregationComponent' },
          ],
        }
      : undefined;
  }, [totalRows, showStatusBar, columnLevelStats]);

  const cellSelection = useMemo(() => (enableCellSelection ? cellSelectionConfig : undefined), [enableCellSelection]);

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      pinned: 'left',
      headerComponent: CustomGroupHeader,
      editable: false,
      suppressFillHandle: true,
      cellClass: 'p-0 f-11-400 text-GRAY_1000 content-center',
      suppressMovable: true,
      lockPinned: true,
    }),
    [],
  );

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const result = [];

      if (onDrilldownClick) {
        result.push({
          name: 'Source drill down',
          action: () => {
            onDrilldownClick?.(params?.node?.data);
          },
          menuItem: CustomContextMenuItem,
          menuItemParams: {
            iconId: 'arrow-narrow-up-right',
          },
        });
      }
      if (onRowPropertiesClick) {
        result.push({
          name: menuTitle ?? 'Row properties',
          action: () => {
            onRowPropertiesClick?.(params?.node?.data);
          },
          menuItem: CustomContextMenuItem,
          menuItemParams: {
            iconId: 'info-circle',
          },
        });
      }

      return result;
    },
    [onDrilldownClick, onRowPropertiesClick, menuTitle],
  );

  const getRowId = useCallback((params: GetRowIdParams) => {
    return params.data?.id ?? params.data?._zamp_id ?? Object.values(params?.data)[0];
  }, []);

  const handleCellClickedInternal = useCallback(
    (event: CellClickedEvent) => {
      onCellClicked?.(event);
    },
    [onCellClicked],
  );

  const handleCellDoubleClickedInternal = useCallback(
    (event: CellDoubleClickedEvent) => {
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        doubleClickTimerRef.current = null;
      }

      setLinkPopover(null);
      onCellDoubleClicked?.(event);
    },
    [onCellDoubleClicked],
  );

  const handleCloseLinkPopover = useCallback(() => {
    setLinkPopover(null);
  }, []);

  // Single handler for ALL focus changes
  const handleCellFocused = useCallback(
    (event: CellFocusedEvent) => {
      // Clear any pending popover open from a previous focus change
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        doubleClickTimerRef.current = null;
      }

      // Always close the existing popover immediately when focus moves
      setLinkPopover(null);

      const { rowIndex, column } = event;

      if (rowIndex == null || !column) return;

      const api = tableRef?.current?.api;

      if (!api) return;

      const colId = typeof column === 'string' ? column : column.getColId();
      const rowNode = api.getDisplayedRowAtIndex(rowIndex);

      if (!rowNode) return;

      // Read value directly from the row data using the column field
      const colDef = typeof column === 'string' ? api.getColumn(column)?.getColDef() : column.getColDef();
      const field = colDef?.field;
      const cellValue = field ? rowNode.data?.[field] : undefined;

      if (!isCellValueUrl(cellValue)) return;

      // Short delay so a double-click can cancel this before the popover appears
      doubleClickTimerRef.current = setTimeout(() => {
        doubleClickTimerRef.current = null;

        const gridEl = gridContainerRef.current;

        if (!gridEl) return;

        const cellEl = gridEl.querySelector(`[row-index="${rowIndex}"] [col-id="${colId}"]`) as HTMLElement | null;

        if (!cellEl) return;

        const rect = cellEl.getBoundingClientRect();
        const gridWrapper = cellEl.closest('.ag-root-wrapper') as HTMLElement | null;
        const gridRect =
          gridWrapper?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);

        setLinkPopover({ url: cellValue.trim(), cellRect: rect, gridRect });
      }, 100);
    },
    [tableRef],
  );

  useEffect(() => {
    return () => {
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        doubleClickTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={gridContainerRef} style={containerStyle}>
      <div className='dataset' style={gridStyle}>
        <AgGridReact
          ref={tableRef}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          theme={theme}
          sideBar={sideBar}
          icons={icons}
          onCellDoubleClicked={handleCellDoubleClickedInternal}
          statusBar={statusBar}
          cellSelection={cellSelection}
          suppressCellFocus={suppressCellFocus}
          onColumnVisible={onColumnVisible}
          readOnlyEdit
          onCellEditRequest={onCellEditRequest}
          onFillEnd={onFillEnd}
          onRowClicked={onRowClicked}
          getContextMenuItems={getContextMenuItems}
          autoSizeStrategy={autoSizeStrategy}
          suppressServerSideFullWidthLoadingRow
          suppressScrollOnNewData={suppressScrollOnNewData}
          serverSideInitialRowCount={100}
          autoGroupColumnDef={autoGroupColumnDef}
          enableCellTextSelection
          noRowsOverlayComponent={CustomNoRowsOverlay}
          loadingOverlayComponent={CustomLoadingOverlay}
          maintainColumnOrder
          suppressDragLeaveHidesColumns
          onColumnMoved={onColumnMoved}
          onGridReady={onGridReady}
          rowDragManaged={enableRowDrag}
          rowDragEntireRow={enableRowDrag}
          onRowDragEnd={onRowDragEnd}
          onCellClicked={handleCellClickedInternal}
          onCellFocused={handleCellFocused}
          getRowId={useGetRowId ? getRowId : undefined}
          {...(serverSideDatasource
            ? {
                rowModelType: 'serverSide',
                serverSideDatasource,
                cacheBlockSize: PAGE_SIZE,
                maxConcurrentDatasourceRequests: 10,
                blockLoadDebounceMillis: 100,
              }
            : { rowData: rows })}
        />
      </div>
      {linkPopover && (
        <LinkCellPopover
          url={linkPopover.url}
          cellRect={linkPopover.cellRect}
          gridRect={linkPopover.gridRect}
          onClose={handleCloseLinkPopover}
        />
      )}
    </div>
  );
};

export default Table;
