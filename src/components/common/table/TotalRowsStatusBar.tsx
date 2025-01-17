import React from 'react';
import { CustomStatusPanelProps } from 'ag-grid-react';
import { getCommaSeparatedNumber } from 'utils/common';

const TotalRowsStatusBar = (props: CustomStatusPanelProps & { totalRows?: number }) => {
  return <div className='f-11-500 py-2'>Total Rows: {getCommaSeparatedNumber(props?.totalRows)}</div>;
};

export default TotalRowsStatusBar;
