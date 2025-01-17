import React, { FC } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';
import { DATA_TABLE_CONFIG, dataTableTheme } from 'components/common/table/constants';

interface DataTableProps {
  columns: MapAny[];
  rows: MapAny[];
  onRowClicked?: (event: RowClickedEvent) => void;
}

const DataTable: FC<DataTableProps> = ({ columns = [], rows = [], onRowClicked }) => {
  return (
    <Table
      columns={columns}
      rows={rows}
      columnConfig={DATA_TABLE_CONFIG}
      customTheme={dataTableTheme}
      onRowClicked={onRowClicked}
      suppressCellFocus
    />
  );
};

export default DataTable;
