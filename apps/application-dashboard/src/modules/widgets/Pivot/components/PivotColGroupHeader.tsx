import { FC, memo } from 'react';
import { ColGroupDef } from 'ag-grid-community';
import { PIVOT_HEADER_BG } from 'constants/icons';
import { DISPLAY_CONFIG_CELL_TYPE } from 'modules/widgets/displayConfig/displayConfig.types';
import { formatColGroupHeaderDisplayName } from 'modules/widgets/Pivot/pivot.utils';
import Image from 'next/image';
import { cn } from 'utils/common';
import { getCellStyle } from '@/modules/widgets/displayConfig/DisplayConfig';

type PivotAutoGroupHeaderProps = {
  displayName: string;
  isSingleHeader: boolean;
  groupId?: string;
  colGroupDef?: ColGroupDef;
};

const PivotColGroupHeader: FC<PivotAutoGroupHeaderProps> = (params) => {
  const { displayName, isSingleHeader, colGroupDef } = params;
  const { mainText, suffix } = formatColGroupHeaderDisplayName(displayName);

  const resultantConfigStyles = getCellStyle({
    cellType: DISPLAY_CONFIG_CELL_TYPE.HEADER_CELL,
    colGroupDef: colGroupDef,
  });

  return (
    <div
      className={cn(
        'w-full h-full p-3 flex flex-col items-center justify-center bg-white break-words whitespace-normal overflow-hidden',
        isSingleHeader && 'relative flex items-end justify-end',
      )}
      style={resultantConfigStyles}
    >
      {isSingleHeader && (
        <Image
          src={PIVOT_HEADER_BG}
          alt='Pivot Header Background'
          fill
          priority
          className='shrink-0 object-cover object-center'
        />
      )}
      <div className='relative flex gap-2 justify-center items-center z-10 text-center'>
        <span className={cn(isSingleHeader ? 'f-13-550' : 'f-13-450')}> {mainText}</span>
        {suffix && (
          <span className='p-1.5 py-1 rounded border border-GRAY_400 bg-white f-12-450 text-GRAY_900'>{suffix}</span>
        )}
      </div>
    </div>
  );
};

export default memo(PivotColGroupHeader);
