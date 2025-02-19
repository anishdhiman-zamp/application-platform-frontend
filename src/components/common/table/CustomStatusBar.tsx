import React from 'react';
import { CustomStatusPanelProps } from 'ag-grid-react';
import { MapAny } from 'types/commonTypes';
import { getCommaSeparatedNumber, sentenceCase } from 'utils/common';

const CustomStatusBar = (props: CustomStatusPanelProps & { totalRows?: number; statusBarValues?: MapAny }) => {
  return (
    <div className='flex gap-2 f-11-500 py-2'>
      <div>Total Rows: {getCommaSeparatedNumber(props?.totalRows)}</div>
      {props?.statusBarValues ? (
        <>
          {Object.entries(props?.statusBarValues).map(([key, value]) => {
            return (
              <div key={key}>
                {sentenceCase(key?.toLowerCase())}: {getCommaSeparatedNumber(value, 2)}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
};

export default CustomStatusBar;
