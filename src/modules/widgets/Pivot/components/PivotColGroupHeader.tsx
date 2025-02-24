import { FC, memo } from 'react';
import { PIVOT_HEADER_BG } from 'constants/icons';
import { formatPivotValue } from 'modules/widgets/Pivot/pivot.utils';
import Image from 'next/image';

type PivotAutoGroupHeaderProps = {
  displayName: string;
  isSingleHeader: boolean;
};

const PivotColGroupHeader: FC<PivotAutoGroupHeaderProps> = ({ displayName, isSingleHeader = false }) => {
  const formattedDisplayName = formatPivotValue(displayName);

  return (
    <>
      {isSingleHeader ? (
        <div className='relative w-full h-full flex items-end justify-end p-3 break-words whitespace-normal bg-white overflow-hidden'>
          <Image
            src={PIVOT_HEADER_BG}
            alt='Pivot Header Background'
            fill
            priority
            className='shrink-0 object-cover object-center'
          />
          <div className='relative z-10 f-13-550'>{formattedDisplayName}</div>
        </div>
      ) : (
        <div className='w-full h-full f-13-450 p-3 flex items-center justify-center bg-white'>
          {formattedDisplayName}
        </div>
      )}
    </>
  );
};

export default memo(PivotColGroupHeader);
