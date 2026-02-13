import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';

import { PREVIEW_DATASET_ID } from '../constants';
import { useDatasetCreationContext } from '../context/DatasetCreationContext';

/** Props for the custom table component */
export interface DatasetTableComponentProps {
  tableRef: RefObject<AgGridReact | null>;
  columns: ColDef[];
  rows: Record<string, unknown>[];
  showStatusBar?: boolean;
  suppressCellFocus?: boolean;
  enableCellSelection?: boolean;
  autoSizeStrategy?: unknown;
  columnConfig?: { flex?: number; minWidth?: number };
  onGridReady?: (params: GridReadyEvent) => void;
}

/** Props for the display options component */
export interface DisplayOptionsComponentProps {
  tableRef: RefObject<AgGridReact | null>;
  datasetId: string;
  isGroupByDisabled?: boolean;
}

interface PreviewDatasetProps {
  TableComponent?: FC<DatasetTableComponentProps>;
  DisplayOptionsComponent?: FC<DisplayOptionsComponentProps>;
  datasetId?: string;
}

const PreviewDataset: FC<PreviewDatasetProps> = ({
  TableComponent,
  DisplayOptionsComponent,
  datasetId = PREVIEW_DATASET_ID,
}) => {
  const tableRef = useRef<AgGridReact | null>(null);
  const { columns: datasetColumns } = useDatasetCreationContext();

  // Generate column definitions from dataset columns
  const columnDefs = useMemo(() => {
    if (!datasetColumns || datasetColumns?.length === 0) {
      return [];
    }

    // Common column configuration for preview dataset
    // Use flex: 0 to disable flex sizing and respect the fixed width
    const commonColConfig = {
      width: 200,
      minWidth: 200,
      flex: 0,
      resizable: true,
      filter: false,
      suppressMenu: true,
      sortable: false,
    };

    // If no columns with names, show all columns (even empty ones)
    const filteredColumns = datasetColumns.filter((col) => col?.column_name?.trim() !== '');

    if (filteredColumns.length === 0) {
      // Show columns even if they don't have names yet
      return datasetColumns.map((col) => ({
        field: col?.id, // Always use ID as the stable identifier
        headerName: col?.column_name || col?.id, // Display name, fallback to ID if empty
        ...commonColConfig,
      }));
    }

    // Always use col.id as the field (stable identifier for AG Grid)
    return filteredColumns.map((col) => ({
      field: col?.id, // Always use ID as the stable identifier
      headerName: col?.column_name, // Display name
      ...commonColConfig,
    }));
  }, [datasetColumns]);

  const emptyRows = useMemo(() => {
    // Safety check: if no columns, return empty rows array
    if (!datasetColumns || datasetColumns.length === 0) {
      return [];
    }

    const rows: Record<string, unknown>[] = [];
    const rowCount = 30; // Number of empty rows to display

    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, unknown> = { id: `empty-row-${i}` };

      // Always use col.id as the field name to match the column definitions
      datasetColumns.forEach((col) => {
        row[col.id] = '';
      });

      rows.push(row);
    }

    return rows;
  }, [datasetColumns]);

  // Ensure grid is initialized correctly on ready
  const handleGridReady = (params: GridReadyEvent) => {
    // Ensure columns are set correctly on grid ready
    params.api?.setGridOption('columnDefs', columnDefs);
    params.api?.setGridOption('rowData', emptyRows);
  };

  // Update grid columns when columnDefs change
  useEffect(() => {
    if (tableRef.current?.api) {
      // Use setTimeout to ensure grid processes the update
      setTimeout(() => {
        tableRef.current?.api?.setGridOption('columnDefs', columnDefs);
        tableRef.current?.api?.setGridOption('rowData', emptyRows);
      }, 100);
    }
  }, [columnDefs, emptyRows]);

  // If custom table component is provided, use it
  if (TableComponent) {
    return (
      <div className='mb-20 flex h-full w-full flex-col'>
        {DisplayOptionsComponent && (
          <div className='flex items-center justify-end px-4 py-3'>
            <DisplayOptionsComponent tableRef={tableRef} datasetId={datasetId} isGroupByDisabled={true} />
          </div>
        )}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <TableComponent
            tableRef={tableRef}
            columns={columnDefs}
            rows={emptyRows}
            showStatusBar={false}
            suppressCellFocus={true}
            enableCellSelection={false}
            autoSizeStrategy={undefined}
            columnConfig={{ flex: 0, minWidth: 200 }}
            onGridReady={handleGridReady}
          />
        </div>
      </div>
    );
  }

  // Default: use basic AG Grid
  return (
    <div className='mb-20 flex h-full w-full flex-col'>
      <div className='ag-theme-alpine min-h-0 flex-1 overflow-hidden'>
        <AgGridReact
          ref={tableRef}
          columnDefs={columnDefs}
          rowData={emptyRows}
          onGridReady={handleGridReady}
          suppressCellFocus={true}
        />
      </div>
    </div>
  );
};

export default PreviewDataset;
