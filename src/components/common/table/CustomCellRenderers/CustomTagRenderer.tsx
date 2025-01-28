import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { getTagLabel } from 'components/filter/filter.utils';

const CustomTagRenderer = (props: ICellRendererParams) => {
  const { value } = props;

  return <div className='py-1 px-1.5 bg-gray-100 rounded w-fit'>{getTagLabel(value)}</div>;
};

export default CustomTagRenderer;
