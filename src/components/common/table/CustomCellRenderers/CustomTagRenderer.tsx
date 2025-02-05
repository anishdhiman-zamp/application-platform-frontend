import React, { useMemo } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { getTagLabel } from 'components/filter/filter.utils';

const CustomTagRenderer = (props: ICellRendererParams) => {
  const { value } = props;

  const tag = useMemo(() => getTagLabel(value), [value]);

  return tag ? <div className='py-1 px-1.5 bg-gray-100 rounded w-fit'>{tag}</div> : <></>;
};

export default CustomTagRenderer;
