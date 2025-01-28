import React, { FC } from 'react';
import {
  CellDoubleClickedEvent,
  CellEditRequestEvent,
  ColDef,
  ColumnVisibleEvent,
  IServerSideDatasource,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';

interface DatasetTableProps {
  tableRef?: React.RefObject<AgGridReact>;
  columns: MapAny[];
  serverSideDatasource?: IServerSideDatasource;
  columnConfig?: ColDef;
  totalRows?: number;
  onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;
  rows?: MapAny[];
  onColumnVisible?: (event: ColumnVisibleEvent) => void;
  onCellEditRequest?: (event: CellEditRequestEvent) => void;
}

const DatasetTable: FC<DatasetTableProps> = ({
  columns,
  rows,
  onCellDoubleClicked,
  tableRef,
  totalRows,
  serverSideDatasource,
  columnConfig,
  onColumnVisible,
  onCellEditRequest,
}) => {
  return (
    <Table
      tableRef={tableRef}
      columns={columns}
      rows={rows}
      columnConfig={columnConfig}
      onCellDoubleClicked={onCellDoubleClicked}
      totalRows={totalRows}
      serverSideDatasource={serverSideDatasource}
      onCellEditRequest={onCellEditRequest}
      showStatusBar
      enableCellSelection
      onColumnVisible={onColumnVisible}
    />
  );
};

export default DatasetTable;
