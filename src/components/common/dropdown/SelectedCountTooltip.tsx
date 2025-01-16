import React, { FC } from 'react';
import { SelectedCountTooltipPropsType } from 'types/common/components/dropdown/dropdown.types';
import { Tooltip, TooltipPositions } from 'components/common/tooltip';

const SelectedCountTooltip: FC<SelectedCountTooltipPropsType> = ({ value, tooltipBodyClassName }) => {
  return (
    <div>
      <Tooltip
        style={{ right: '-34px' }}
        caratClassName='tw-border-b-GRAY_700 tw-left-[calc(100%-50px)]'
        position={TooltipPositions.BOTTOM}
        disabled={value.length === 0}
        tooltipBody={
          <div className='tw-flex tw-flex-col tw-gap-2'>
            {value?.map((item) => (
              <div key={item?.value} className='tw-whitespace-nowrap'>
                {item?.label}
              </div>
            ))}
          </div>
        }
        tooltipBodystyle={`tw-bg-GRAY_700 tw-text-white f-12-300 !tw-px-3 !tw-py-2  ${tooltipBodyClassName}`}
      >
        {!!value.length && (
          <div className='tw-bg-BASE_PRIMARY f-10-600 tw-h-4 tw-w-5 tw-flex tw-items-center tw-justify-center'>
            {value.length}
          </div>
        )}
      </Tooltip>
    </div>
  );
};

export default SelectedCountTooltip;
