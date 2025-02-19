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
        <div className='relative w-full h-full flex items-end justify-end p-3 break-words whitespace-normal bg-white overflow-hidden '>
          <Image
            src={PIVOT_HEADER_BG}
            fill
            alt='Pivot Header Background'
            objectFit='cover'
            priority
            className='scale-[1.5]'
          />
          <div className='relative z-10 f-13-550'>{displayName}</div>
        </div>
      ) : (
        <div className='w-full h-full f-13-450 p-3 flex items-center justify-center bg-white'>{displayName}</div>
      )}
    </>
  );
};

export default memo(PivotColGroupHeader);
