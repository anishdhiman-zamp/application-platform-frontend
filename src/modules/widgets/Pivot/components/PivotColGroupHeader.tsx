import { FC, memo } from 'react';
import { PIVOT_HEADER_BG } from 'constants/icons';
import Image from 'next/image';

type PivotAutoGroupHeaderProps = {
  displayName: string;
  isSingleValue: boolean;
};

const PivotColGroupHeader: FC<PivotAutoGroupHeaderProps> = ({ displayName, isSingleValue = false }) => {
  return (
    <>
      {isSingleValue ? (
        <div className='relative w-full h-full flex items-center justify-center p-3 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 break-words whitespace-normal bg-white overflow-hidden'>
          <Image
            src={PIVOT_HEADER_BG}
            fill
            alt='Pivot Header Background'
            objectFit='cover'
            priority
            className='scale-[1.9]'
          />
          <div className='relative z-10'>{displayName}</div>
        </div>
      ) : (
        <div className='w-full h-full f-13-450 p-3 flex items-center justify-center bg-white border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400'>
          {displayName}
        </div>
      )}
    </>
  );
};

export default memo(PivotColGroupHeader);
