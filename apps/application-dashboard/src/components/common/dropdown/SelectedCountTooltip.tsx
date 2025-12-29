import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { SelectedCountTooltipPropsType } from 'types/common/components/dropdown/dropdown.types';
import { ALIGN_OPTIONS, SIDE_OPTIONS } from '@/types/commonTypes';
import TooltipV2 from 'components/common/TooltipV2';

const SelectedCountTooltip: FC<SelectedCountTooltipPropsType> = ({ value, tooltipBodyClassName }) => {
  return (
    <div>
      <TooltipV2
        side={SIDE_OPTIONS.BOTTOM}
        align={ALIGN_OPTIONS.END}
        alignOffset={-34}
        disabled={value?.length === 0}
        tooltipBody={
          <div className='flex flex-col gap-2'>
            {value?.map((item) => (
              <div key={item?.value} className='whitespace-nowrap'>
                {item?.label}
              </div>
            ))}
          </div>
        }
        tooltipClassName={cn('bg-GRAY_700 text-white f-12-300 px-3! py-2! ', tooltipBodyClassName)}
      >
        {!!value?.length && (
          <div className='bg-BASE_PRIMARY f-10-600 flex h-4 w-5 items-center justify-center'>{value?.length}</div>
        )}
      </TooltipV2>
    </div>
  );
};

export default SelectedCountTooltip;
