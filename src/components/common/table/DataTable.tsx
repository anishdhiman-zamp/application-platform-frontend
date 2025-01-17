import React, { FC } from 'react';
import { IServerSideDatasource, RowClickedEvent } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';
import { DATA_TABLE_CONFIG, dataTableTheme } from 'components/common/table/constants';

interface DataTableProps {
  columns: MapAny[];
  rows?: MapAny[];
  onRowClicked?: (event: RowClickedEvent) => void;
  serverSideDatasource?: IServerSideDatasource;
}

const DataTable: FC<DataTableProps> = ({ columns = [], rows = [], onRowClicked, serverSideDatasource }) => {
  return (
    <Table
      columns={columns}
      rows={rows}
      columnConfig={DATA_TABLE_CONFIG}
      customTheme={dataTableTheme}
      onRowClicked={onRowClicked}
      serverSideDatasource={serverSideDatasource}
      suppressCellFocus
    />
  );
};

export default DataTable;
