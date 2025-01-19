import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const CustomAmountRenderer = (props: ICellRendererParams) => {
  const { colDef, data, value } = props;
  const formattedValue = `${data[colDef?.cellRendererParams?.currency_column_prefix]} ${value}`;

  return <div>{formattedValue}</div>;
};

export default CustomAmountRenderer;
