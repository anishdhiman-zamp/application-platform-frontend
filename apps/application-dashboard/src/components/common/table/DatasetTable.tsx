import { FC, RefObject } from 'react';
import {
  type CellClickedEvent,
  CellDoubleClickedEvent,
  CellEditRequestEvent,
  ColDef,
  ColumnMovedEvent,
  ColumnVisibleEvent,
  FillEndEvent,
  GridReadyEvent,
  type IRowNode,
  IServerSideDatasource,
  RowClickedEvent,
  RowDragEndEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  Theme,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { MissingFieldItemType } from 'types/api/processApi.types';
import { MapAny } from 'types/commonTypes';
import Table from 'components/common/table';

export interface DatasetTableProps {
  tableRef?: RefObject<AgGridReact | null>;
  columns: MapAny[];
  serverSideDatasource?: IServerSideDatasource;
  columnConfig?: ColDef;
  totalRows?: number;
  onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;
  rows?: MapAny[];
  onColumnVisible?: (event: ColumnVisibleEvent) => void;
  onCellEditRequest?: (event: CellEditRequestEvent) => void;
  onFlushPendingEdit?: (params: { node: IRowNode; colId: string; value: unknown }) => void;
  onFillEnd?: (event: FillEndEvent) => void;
  onDrilldownClick?: (data: MapAny) => void;
  onRowPropertiesClick?: (data: MapAny) => void;
  onColumnMoved?: (event: ColumnMovedEvent) => void;
  columnLevelStats?: MapAny;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  onRowClicked?: (event: RowClickedEvent) => void;
  customTheme?: Theme;
  headerClass?: string;
  cellClass?: string;
  suppressCellFocus?: boolean;
  enableCellSelection?: boolean;
  onGridReady?: (params: GridReadyEvent) => void;
  menuTitle?: string;
  enableRowDrag?: boolean;
  onRowDragEnd?: (event: RowDragEndEvent) => void;
  showStatusBar?: boolean;
  missingFields?: MissingFieldItemType[];
  completedFields?: { rowId: string; columnId: string }[];
  shouldShowNA?: boolean;
  onCellClicked?: (event: CellClickedEvent) => void;
  useGetRowId?: boolean;
  autoSizeStrategy?:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy;
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
  onFlushPendingEdit,
  onFillEnd,
  onDrilldownClick,
  onRowPropertiesClick,
  onColumnMoved,
  columnLevelStats,
  containerStyle,
  gridStyle,
  onRowClicked,
  customTheme,
  headerClass,
  cellClass,
  suppressCellFocus = false,
  enableCellSelection = true,
  onGridReady,
  menuTitle,
  enableRowDrag,
  onRowDragEnd,
  showStatusBar = true,
  missingFields,
  completedFields,
  shouldShowNA = false,
  onCellClicked,
  useGetRowId = false,
  autoSizeStrategy,
}) => {
  return (
    <div id='dataset-table' data-testid='dataset-table'>
      <Table
        tableRef={tableRef}
        columns={columns}
        rows={rows}
        columnConfig={columnConfig}
        onCellDoubleClicked={onCellDoubleClicked}
        totalRows={totalRows}
        serverSideDatasource={serverSideDatasource}
        onCellEditRequest={onCellEditRequest}
        onFlushPendingEdit={onFlushPendingEdit}
        showStatusBar={showStatusBar}
        enableCellSelection={enableCellSelection}
        suppressCellFocus={suppressCellFocus}
        onColumnVisible={onColumnVisible}
        onFillEnd={onFillEnd}
        onDrilldownClick={onDrilldownClick}
        onRowPropertiesClick={onRowPropertiesClick}
        onColumnMoved={onColumnMoved}
        columnLevelStats={columnLevelStats}
        containerStyle={containerStyle}
        gridStyle={gridStyle}
        onRowClicked={onRowClicked}
        customTheme={customTheme}
        headerClass={headerClass}
        cellClass={cellClass}
        onGridReady={onGridReady}
        menuTitle={menuTitle}
        enableRowDrag={enableRowDrag}
        onRowDragEnd={onRowDragEnd}
        missingFields={missingFields}
        completedFields={completedFields}
        shouldShowNA={shouldShowNA}
        onCellClicked={onCellClicked}
        useGetRowId={useGetRowId}
        autoSizeStrategy={autoSizeStrategy}
      />
    </div>
  );
};

export default DatasetTable;
