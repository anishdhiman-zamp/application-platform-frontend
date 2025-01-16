import React, { ReactNode, useMemo } from 'react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  CustomFilterModule,
  DateFilterModule,
  IServerSideDatasource,
  ModuleRegistry,
  NumberFilterModule,
  RowClickedEvent,
  TextFilterModule,
  Theme,
  ValidationModule,
} from 'ag-grid-community';
import {
  AdvancedFilterModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  MultiFilterModule,
  RowGroupingPanelModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { MapAny } from 'types/commonTypes';
import { AggregationFunctionMap, myIcons, myTheme, PAGE_SIZE, sideBarConfig } from 'components/common/table/constants';

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
  hideSideBar?: boolean;
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
  gridStyle = { height: '100%', width: '100%' },
  serverSideDatasource,
  customTheme,
  onRowClicked,
  hideSideBar = false,
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
      cellClass: 'f-11-400 text-GRAY_1000 content-center !px-2 py-1',
      allowedAggFuncs: Object.keys(AggregationFunctionMap),
      ...columnConfig,
    };
  }, [columnConfig]);

  const icons = useMemo<MapAny>(() => {
    return myIcons;
  }, []);

  const sideBar = useMemo(() => (hideSideBar ? null : sideBarConfig), [hideSideBar]);

  const theme = useMemo<Theme | 'legacy'>(() => {
    return customTheme ?? myTheme;
  }, [customTheme]);

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
          maxConcurrentDatasourceRequests={10}
          blockLoadDebounceMillis={100}
          {...(columnConfig?.enableRowGroup ? { rowGroupPanelShow: 'always' } : {})}
          {...(serverSideDatasource
            ? { rowModelType: 'serverSide', serverSideDatasource, cacheBlockSize: PAGE_SIZE }
            : { rowData: rows })}
        />
      </div>
    </div>
  );
};

export default Table;
