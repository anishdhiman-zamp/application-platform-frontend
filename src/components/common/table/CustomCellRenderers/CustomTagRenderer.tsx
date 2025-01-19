import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const CustomTagRenderer = (props: ICellRendererParams) => {
  const { value } = props;
  const tag = value.split('.').pop();

  return <div className='py-1 px-1.5 bg-gray-100 rounded w-fit'>{tag}</div>;
};

export default CustomTagRenderer;
