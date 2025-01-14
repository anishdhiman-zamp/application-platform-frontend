import React, { FC } from 'react';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';
import { DATA_TABLE_CONFIG, dataTableTheme } from 'components/common/table/constants';

interface DataTableProps {
  columns: MapAny[];
  rows: MapAny[];
}

const DataTable: FC<DataTableProps> = ({ columns = [], rows = [] }) => {
  return <Table columns={columns} rows={rows} columnConfig={DATA_TABLE_CONFIG} customTheme={dataTableTheme} />;
};

export default DataTable;
