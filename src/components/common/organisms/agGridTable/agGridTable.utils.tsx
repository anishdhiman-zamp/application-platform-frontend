import React from 'react';
import { CustomCellRendererProps } from 'ag-grid-react';
import SkeletonElement from 'components/common/atoms/skeletons/SkeletonElement';
import { WorkspaceDisplayColumns } from 'components/common/organisms/agGridTable/agGrid.types';
import { ColumnDef } from 'components/common/organisms/agGridTable/AgGridTable';

export const getColumnDefs = (columnList: WorkspaceDisplayColumns[]) => {
  const formattedColumns: ColumnDef[] = columnList?.map((column) => ({
    headerName: column.display_name,
    field: column.column_name,
    textWrap: true,
    minWidth: 300,
    cellStyle: {
      backgroundColor: 'white',
    },
    cellClass: 'f-12-300 group content-center',
    cellRenderer: (props: CustomCellRendererProps) => {
      if (column.Component) {
        return <column.Component {...props} />;
      } else if (props.value !== undefined) {
        return props.value;
      } else {
        return <SkeletonElement className='w-52 h-5' />;
      }
    },
  }));

  return formattedColumns;
};
