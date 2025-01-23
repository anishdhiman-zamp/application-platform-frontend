import React, { FC } from 'react';
import { CellEditRequestEvent, ColDef, IServerSideDatasource, RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';

interface DatasetTableProps {
  tableRef?: React.RefObject<AgGridReact>;
  columns: MapAny[];
  serverSideDatasource?: IServerSideDatasource;
  columnConfig?: ColDef;
  totalRows?: number;
  onRowClicked?: (event: RowClickedEvent) => void;
  rows?: MapAny[];
  onCellEditRequest?: (event: CellEditRequestEvent) => void;
}

const DatasetTable: FC<DatasetTableProps> = ({
  columns,
  rows,
  onRowClicked,
  tableRef,
  totalRows,
  serverSideDatasource,
  columnConfig,
  onCellEditRequest,
}) => {
  return (
    <Table
      tableRef={tableRef}
      columns={columns}
      rows={rows}
      columnConfig={columnConfig}
      onRowClicked={onRowClicked}
      totalRows={totalRows}
      serverSideDatasource={serverSideDatasource}
      onCellEditRequest={onCellEditRequest}
      showSideBar
      showStatusBar
      enableCellSelection
    />
  );
};

export default DatasetTable;
