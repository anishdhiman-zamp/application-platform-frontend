import { FC } from 'react';
import { IServerSideDatasource, RowClickedEvent } from 'ag-grid-community';
import dynamic from 'next/dynamic';
import { MapAny } from 'types/commonTypes';
import { DATA_TABLE_CONFIG, DATA_TABLE_THEME_PARAMS } from 'components/common/table/table.constants';
import { getDataTableTheme } from 'components/common/table/table.utils';
const Table = dynamic(() => import('components/common/table'));

interface DataTableProps {
  columns: MapAny[];
  rows?: MapAny[];
  onRowClicked?: (event: RowClickedEvent) => void;
  serverSideDatasource?: IServerSideDatasource;
  overrideThemeParams?: MapAny;
  gridStyle?: MapAny;
  suppressScrollOnNewData?: boolean;
}

const DataTable: FC<DataTableProps> = ({
  columns = [],
  rows = [],
  onRowClicked,
  serverSideDatasource,
  overrideThemeParams = {},
  gridStyle = { height: 'calc(100vh - 50px)', width: '100%' },
  suppressScrollOnNewData,
}) => {
  const customTheme = getDataTableTheme({ ...DATA_TABLE_THEME_PARAMS, ...overrideThemeParams });

  return (
    <Table
      columns={columns}
      rows={rows}
      columnConfig={DATA_TABLE_CONFIG}
      customTheme={customTheme}
      onRowClicked={onRowClicked}
      serverSideDatasource={serverSideDatasource}
      suppressCellFocus
      gridStyle={gridStyle}
      suppressScrollOnNewData={suppressScrollOnNewData}
    />
  );
};

export default DataTable;
