import { memo } from 'react';
import { ColDef } from 'ag-grid-community';
import { PIVOT_HEADER_BG } from 'constants/icons';
import Image from 'next/image';
import { snakeCaseToSentenceCase } from 'utils/common';

type Props = {
  column: {
    colDef: ColDef;
  };
  displayName: string;
};

const PivotColHeader = (props: Props) => {
  const contextFieldName = snakeCaseToSentenceCase(props.column.colDef?.context?.name || '');

  return (
    <div className='relative w-full h-full flex items-end justify-end p-3 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 break-words whitespace-normal bg-white overflow-hidden'>
      <Image
        src={PIVOT_HEADER_BG}
        alt='Pivot Header Background'
        fill
        objectFit='cover'
        priority
        className='scale-[1.9]'
      />
      <div className='relative z-10'>{contextFieldName || props.displayName}</div>
    </div>
  );
};

export default memo(PivotColHeader);
