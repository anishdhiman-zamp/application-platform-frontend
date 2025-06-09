import React from 'react';
import { Tag } from '@zamp-platform/ui';
import { ICellRendererParams } from 'ag-grid-community';

const PaymentsAccountStatusCell = (props: ICellRendererParams) => {
  const { value, colDef } = props;

  return (
    <Tag variant='gray' className='f-11-500 py-[3.5px] text-blue-700'>
      {
        colDef?.headerComponentParams?.options?.find(
          (option: { label: string; value: string }) => option.value === value,
        )?.label
      }
    </Tag>
  );
};

export default PaymentsAccountStatusCell;
