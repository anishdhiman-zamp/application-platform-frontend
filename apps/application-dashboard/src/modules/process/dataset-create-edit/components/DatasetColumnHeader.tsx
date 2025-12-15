import React, { FC } from 'react';
import { DATASET_COLUMN_HEADERS_LIST } from 'modules/process/process.constant';
import { cn } from '@/utils/common';

const DatasetColumnHeader: FC = () => {
  return (
    <div className='border-GRAY_100 flex items-center justify-between border-b pt-4 pr-8 pl-9'>
      {DATASET_COLUMN_HEADERS_LIST.map((header) => (
        <div
          key={header.value}
          className={cn('f-12-450 text-GRAY_700 py-2.5', !header.width && 'flex-1')}
          style={header.width ? { width: header.width, flex: 'none' } : {}}
        >
          {header.label}
        </div>
      ))}
    </div>
  );
};

export default DatasetColumnHeader;
