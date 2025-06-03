import { FC, ReactNode, RefObject, useCallback, useMemo } from 'react';
import {
  CellDoubleClickedEvent,
  CellEditRequestEvent,
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
  IServerSideDatasource,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  RowApiModule,
  RowClickedEvent,
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
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact, CustomStatusPanelProps } from 'ag-grid-react';
import { COLORS } from 'constants/colors';
import { MapAny } from 'types/commonTypes';
import { cn } from '@/utils/common';
import CustomContextMenuItem from 'components/common/table/CustomContextMenuItem';
import CustomGroupHeader from 'components/common/table/CustomHeader/CustomGroupHeader';
import CustomNoRowsOverlay from 'components/common/table/CustomNoRowsOverlay';
import CustomStatusBar from 'components/common/table/CustomStatusBar';
import {
  AggregationFunctionMap,
  cellSelectionConfig,
  myIcons,
  myTheme,
  PAGE_SIZE,
  sideBarConfig,
} from 'components/common/table/table.constants';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ServerSideRowModelModule,
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
  ValidationModule /* Development Only */,
]);

interface TableProps {
  tableRef?: RefObject<AgGridReact>;
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
  onGridReady?: () => void;
  menuTitle?: string;
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
}) => {
  // @ts-ignore cellStyle is not typed
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      minWidth: 150,
      filter: 'agTextColumnFilter',
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (!params.value) {
          return 'N/A';
        }

        return params.value;
      },
      floatingFilter: false,
      headerClass: cn('f-12-600 text-GRAY_1000', headerClass),
      cellClass: (params: MapAny) => {
        const baseClasses = 'f-11-400 content-center !px-2 py-1';
        const interactiveClass = onCellDoubleClicked || onRowClicked ? 'cursor-pointer' : '';
        const valueClass = !params.value ? 'text-GRAY_500' : 'text-GRAY_1000';

        return cn(baseClasses, valueClass, interactiveClass, cellClass);
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
  }, [columnConfig]);

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

  return (
    <div style={containerStyle}>
      <div className='dataset' style={gridStyle}>
        <AgGridReact
          ref={tableRef}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          theme={theme}
          sideBar={sideBar}
          icons={icons}
          onCellDoubleClicked={onCellDoubleClicked}
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
          serverSideInitialRowCount={100}
          autoGroupColumnDef={autoGroupColumnDef}
          enableCellTextSelection
          noRowsOverlayComponent={CustomNoRowsOverlay}
          maintainColumnOrder
          suppressDragLeaveHidesColumns
          onColumnMoved={onColumnMoved}
          onGridReady={onGridReady}
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
    </div>
  );
};

export default Table;
