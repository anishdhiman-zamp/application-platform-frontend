import React, { ReactNode, useMemo } from 'react';
import {
  CellEditRequestEvent,
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  CustomEditorModule,
  CustomFilterModule,
  DateFilterModule,
  IServerSideDatasource,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  RowClickedEvent,
  TextEditorModule,
  TextFilterModule,
  Theme,
  ValidationModule,
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
import { MapAny } from 'types/commonTypes';
import {
  AggregationFunctionMap,
  cellSelectionConfig,
  myIcons,
  myTheme,
  PAGE_SIZE,
  sideBarConfig,
} from 'components/common/table/table.constants';
import TotalRowsStatusBar from 'components/common/table/TotalRowsStatusBar';

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
  TextEditorModule,
  CustomEditorModule,
  RichSelectModule,
  NumberEditorModule,
  ValidationModule /* Development Only */,
]);

interface TableProps {
  tableRef?: React.RefObject<AgGridReact>;
  rows?: MapAny[];
  columns: MapAny[];
  columnConfig?: ColDef;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  serverSideDatasource?: IServerSideDatasource;
  customTheme?: Theme;
  onRowClicked?: (event: RowClickedEvent) => void;
  showSideBar?: boolean;
  showStatusBar?: boolean;
  totalRows?: number;
  enableCellSelection?: boolean;
  suppressCellFocus?: boolean;
  onCellEditRequest?: (event: CellEditRequestEvent) => void;
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

const Table: React.FC<TableProps> = ({
  tableRef,
  rows = [],
  columns,
  columnConfig,
  containerStyle = { width: '100%', height: '100%' },
  gridStyle = { height: 'calc(100vh - 100px)', width: '100%' },
  serverSideDatasource,
  customTheme,
  onRowClicked,
  showSideBar = false,
  showStatusBar = false,
  totalRows,
  enableCellSelection = false,
  suppressCellFocus = false,
  onCellEditRequest,
}) => {
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: 'agTextColumnFilter',
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true,
      floatingFilter: false,
      headerClass: 'f-12-600 text-GRAY_1000',
      cellClass: `f-11-400 text-GRAY_1000 content-center !px-2 py-1 ${onRowClicked ? 'cursor-pointer' : ''}`,
      allowedAggFuncs: Object.keys(AggregationFunctionMap),
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
            { statusPanel: (props: CustomStatusPanelProps) => <TotalRowsStatusBar {...props} totalRows={totalRows} /> },
            { statusPanel: 'agAggregationComponent' },
          ],
        }
      : undefined;
  }, [totalRows, showStatusBar]);

  const cellSelection = useMemo(() => (enableCellSelection ? cellSelectionConfig : undefined), [enableCellSelection]);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          ref={tableRef}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          theme={theme}
          sideBar={sideBar}
          icons={icons}
          onRowClicked={onRowClicked}
          statusBar={statusBar}
          cellSelection={cellSelection}
          suppressCellFocus={suppressCellFocus}
          readOnlyEdit
          onCellEditRequest={onCellEditRequest}
          {...(columnConfig?.enableRowGroup ? { rowGroupPanelShow: 'always' } : {})}
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
