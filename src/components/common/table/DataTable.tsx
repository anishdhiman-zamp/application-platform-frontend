import React, { FC } from 'react';
import { CellDoubleClickedEvent, IServerSideDatasource } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';
import { DATA_TABLE_CONFIG, DATA_TABLE_THEME_PARAMS } from 'components/common/table/table.constants';
import { getDataTableTheme } from 'components/common/table/table.utils';

interface DataTableProps {
  columns: MapAny[];
  rows?: MapAny[];
  onRowClicked?: (event: CellDoubleClickedEvent) => void;
  serverSideDatasource?: IServerSideDatasource;
  overrideThemeParams?: MapAny;
}

const DataTable: FC<DataTableProps> = ({
  columns = [],
  rows = [],
  onRowClicked,
  serverSideDatasource,
  overrideThemeParams = {},
}) => {
  const customTheme = getDataTableTheme({ ...DATA_TABLE_THEME_PARAMS, ...overrideThemeParams });

  return (
    <Table
      columns={columns}
      rows={rows}
      columnConfig={DATA_TABLE_CONFIG}
      customTheme={customTheme}
      onCellDoubleClicked={onRowClicked}
      serverSideDatasource={serverSideDatasource}
      suppressCellFocus
    />
  );
};

export default DataTable;
