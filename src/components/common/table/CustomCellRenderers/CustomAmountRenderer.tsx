import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const CustomAmountRenderer = (props: ICellRendererParams) => {
  const { colDef, data, value } = props;
  const prefix = data[colDef?.cellRendererParams?.currency_column_prefix]?.toUpperCase();
  const formattedValue = prefix ? `${prefix} ${value}` : value;

  return <div>{formattedValue}</div>;
};

export default CustomAmountRenderer;
