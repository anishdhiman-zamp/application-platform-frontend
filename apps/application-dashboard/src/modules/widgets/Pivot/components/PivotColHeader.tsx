import { FC, memo } from 'react';
import { ColDef } from 'ag-grid-community';
import { PIVOT_HEADER_BG } from 'constants/icons';
import Image from 'next/image';
import { snakeCaseToSentenceCase } from 'utils/common';

interface PivotColHeaderProps {
  column: {
    colDef: ColDef;
    getColId: () => string;
  };
  displayName: string;
}

const PivotColHeader: FC<PivotColHeaderProps> = (params) => {
  const { column, displayName } = params;
  const contextFieldName = snakeCaseToSentenceCase(column.colDef?.context?.name || '');

  return (
    <div className='border-r-0.5 border-b-0.5 border-GRAY_400 relative flex h-full w-full items-end justify-end overflow-hidden bg-white p-3 break-words whitespace-normal'>
      <Image
        src={PIVOT_HEADER_BG}
        alt='Pivot Header Background'
        fill
        priority
        className='shrink-0 object-cover object-center'
      />
      <span className='f-13-550 relative z-10'>{contextFieldName || displayName}</span>
    </div>
  );
};

export default memo(PivotColHeader);
