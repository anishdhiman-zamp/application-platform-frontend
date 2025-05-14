import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { DEFAULT_BANK } from 'constants/icons';
import { BANK_NAME_ICON_MAPPING } from 'modules/widgets/Pivot/pivot.constants';
import Image from 'next/image';

const BankNameCell = (props: ICellRendererParams) => {
  const { value } = props;

  return (
    <div className='flex items-center gap-1.5'>
      <Image
        src={BANK_NAME_ICON_MAPPING[value?.bank_icon_key as keyof typeof BANK_NAME_ICON_MAPPING]?.icon ?? DEFAULT_BANK}
        height={12}
        width={12}
        alt='bank icon'
      />
      <span>{value?.bank_name}</span>
    </div>
  );
};

export default BankNameCell;
