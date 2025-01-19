import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { format } from 'date-fns';

const CustomDateTimeRenderer = (props: ICellRendererParams) => {
  const { colDef, value } = props;
  const formattedValue = format(new Date(value), colDef?.cellRendererParams?.format);

  return <div>{formattedValue}</div>;
};

export default CustomDateTimeRenderer;
