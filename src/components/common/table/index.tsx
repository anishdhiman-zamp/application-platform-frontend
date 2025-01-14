import React, { ReactNode, useMemo, useRef } from 'react';
import {
  ClientSideRowModelModule,
  ColDef,
  DateFilterModule,
  IServerSideGetRowsParams,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
  Theme,
  ValidationModule,
} from 'ag-grid-community';
import {
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  ServerSideRowModelModule,
  SetFilterModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { MapAny } from 'types/commonTypes';
import { myTheme } from 'components/common/table/constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

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
  ValidationModule /* Development Only */,
]);

interface TableProps {
  rows?: MapAny[];
  columns: MapAny[];
  columnConfig?: MapAny;
  customTheme?: Theme;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  getRows?: (params: IServerSideGetRowsParams) => void;
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
  rows = [],
  columns,
  columnConfig,
  customTheme,
  containerStyle = { width: '100%', height: '100%' },
  gridStyle = { height: '100%', width: '100%' },
  getRows,
}) => {
  const tableRef = useRef<AgGridReact>(null);
  const { dispatch } = useFiltersContextStore();

  // Function to get applied filters
  const getAppliedFilters = () => {
    const filterModel = tableRef?.current?.api?.getFilterModel();

    dispatch({ type: filtersContextActions.SET_SELECTED_FILTERS, payload: { selectedFilters: filterModel } });
  };

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
      ...columnConfig,
    };
  }, [columnConfig]);

  const theme = useMemo<Theme | 'legacy'>(() => {
    return customTheme ?? myTheme;
  }, [customTheme]);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          ref={tableRef}
          onFilterChanged={getAppliedFilters}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          theme={theme}
          {...(getRows
            ? { rowModelType: 'serverSide', serverSideDatasource: { getRows: getRows } }
            : { rowData: rows })}
        />
      </div>
    </div>
  );
};

export default Table;
