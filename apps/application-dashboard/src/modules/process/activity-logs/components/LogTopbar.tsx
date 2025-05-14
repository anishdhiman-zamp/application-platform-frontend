import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TopbarStatusIcon from 'modules/process/common/TopbarStatusIcon';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';

const LogTopbar = () => {
  return (
    <div className='flex justify-between items-center w-full border-b border-GRAY_100 absolute top-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      <div className='flex justify-center items-center gap-x-2 p-4 min-w-max'>
        <div className='flex items-center gap-x-1'>
          <span className='f-13-550 text-GRAY_700'>Invoice number</span>
          <span className='f-13-550 text-GRAY_1000'>4626343</span>
        </div>
        <div className='flex px-2 py-1 rounded-full items-center gap-x-1.5 border border-GRAY_400 bg-BG_GRAY_2'>
          <TopbarStatusIcon
            status={ACTIVITY_RUN_STATUS.IN_PROGRESS}
            fillColor={STATUS_ICON_COLOR_MAPPING[ACTIVITY_RUN_STATUS.IN_PROGRESS]?.tabStatusIcon?.fillColor}
            strokeColor={STATUS_ICON_COLOR_MAPPING[ACTIVITY_RUN_STATUS.IN_PROGRESS]?.tabStatusIcon?.strokeColor}
          />
          <span className='f-12-450 text-GRAY_1000'>{STATUS_ICON_COLOR_MAPPING[ACTIVITY_RUN_STATUS.DONE]?.label}</span>
        </div>

        <TooltipV2 tooltipBody='Mark as void'>
          <Button variant={'outline'} size={'icon'} className='!size-6 !px-3 !py-1 !mt-[2.5px]'>
            <SvgSpriteLoader id='slash-circle-01' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2>
      </div>

      <div className='flex items-center p-4 min-w-max'>
        <span className='f-13-450 text-GRAY_900 mr-3'>8/24</span>
        <TooltipV2 tooltipBody='Move to bottom'>
          <Button variant={'outline'} size={'icon'} className='!size-6 !px-3 !py-1 mr-1.5 !mt-[2.5px]'>
            <SvgSpriteLoader id='arrow-down' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2>

        <TooltipV2 tooltipBody='Move to top'>
          <Button variant={'outline'} size={'icon'} className='!size-6 !px-3 !py-1 !mt-[2.5px]'>
            <SvgSpriteLoader id='arrow-up' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2>
      </div>
    </div>
  );
};

export default LogTopbar;
