import { FC, memo } from 'react';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { PIVOT_HEADER_BG } from 'constants/icons';
import { getFormattedDateWithPeriodicity } from 'modules/widgets/widgets.constant';
import Image from 'next/image';

type PivotAutoGroupHeaderProps = {
  displayName: string;
  isSingleHeader: boolean;
  periodicity?: PERIODICITY_TYPES;
};

const PivotColGroupHeader: FC<PivotAutoGroupHeaderProps> = ({ displayName, periodicity, isSingleHeader = false }) => {
  const formatDisplayName = (displayName: string, periodicity?: PERIODICITY_TYPES): string => {
    if (!isNaN(Date.parse(displayName as string))) {
      return getFormattedDateWithPeriodicity(periodicity ?? PERIODICITY_TYPES.DAILY, displayName as string);
    }

    return displayName;
  };

  return (
    <>
      {isSingleHeader ? (
        <div className='relative w-full h-full flex items-end justify-end p-3 break-words whitespace-normal bg-white overflow-hidden'>
          <Image
            src={PIVOT_HEADER_BG}
            alt='Pivot Header Background'
            fill
            priority
            objectPosition='center'
            objectFit='cover'
            className='shrink-0'
          />
          <div className='relative z-10 f-13-550'>{formatDisplayName(displayName, periodicity)}</div>
        </div>
      ) : (
        <div className='w-full h-full f-13-450 p-3 flex items-center justify-center bg-white'>{displayName}</div>
      )}
    </>
  );
};

export default memo(PivotColGroupHeader);
