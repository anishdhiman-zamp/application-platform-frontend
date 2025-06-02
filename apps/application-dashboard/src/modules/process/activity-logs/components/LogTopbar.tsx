import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TopbarStatusIcon from 'modules/process/common/TopbarStatusIcon';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetActivitySummaryQuery } from '@/apis/processes';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { COLORS } from '@/constants/colors';

const LogTopbar: FC = () => {
  const { activityId } = useParams<{ activityId: string }>() ?? {};
  const searchParams = useSearchParams();
  const processId = searchParams?.get('processId');
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useGetActivitySummaryQuery({
    activityRunId: activityId as string,
    processId: processId as string,
  });

  return (
    <div className='flex justify-between items-center w-full h-15 border-b border-GRAY_100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      <CommonWrapper
        className='flex justify-center items-center gap-x-2 p-4 min-w-max'
        isLoading={isLoadingSummary || isErrorSummary}
        loader={
          <div className='flex items-center gap-x-1'>
            <SkeletonElement className='w-20 h-6 rounded-full' />
          </div>
        }
        skeletonType={SkeletonTypes.CUSTOM}
      >
        {summaryData?.summary?.header &&
          Object.entries(summaryData?.summary?.header).map(([key, value]) => (
            <div key={key} className='flex items-center gap-x-1'>
              <span className='f-13-550 text-GRAY_700 capitalize'>{key}</span>
              <span className='f-13-550 text-GRAY_1000'>{value}</span>
            </div>
          ))}

        <div className='flex px-2 py-1 rounded-full items-center gap-x-1.5 border border-GRAY_400 bg-BG_GRAY_2'>
          <TopbarStatusIcon
            status={summaryData?.summary?.status as ACTIVITY_RUN_STATUS}
            fillColor={
              STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor
            }
            strokeColor={
              STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor
            }
          />
          <span className='f-12-450 text-GRAY_1000'>
            {STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.label}
          </span>
        </div>

        {/* TODO: Add back when we have the functionality */}
        {/* <TooltipV2
          tooltipBody={
            <div className='flex flex-col justify-start items-start gap-y-1 bg-black py-2 px-3 rounded-md'>
              <span className='f-10-450 text-white'>Mark as void</span>
              <p className='f-10-400 text-GRAY_600 text-wrap max-w-[260px]'>
                This run will be voided and no further agent actions will occur. Human updates will still be tracked and
                visible in the activity log
              </p>
            </div>
          }
        >
          <Button variant={'outline'} size={'icon'} className='size-6! px-3! py-1! mt-[2.5px]!'>
            <SvgSpriteLoader id='slash-circle-01' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2> */}
      </CommonWrapper>

      {/* TODO: Add back when we have the functionality */}
      <div className='flex items-center p-4 min-w-max'>
        <span className='f-13-450 text-GRAY_900 mr-3'>8/24</span>
        <TooltipV2 tooltipBody='Move to Next Run'>
          <Button variant={'outline'} size={'icon'} className='size-6! px-3! py-1! mr-1.5 mt-[2.5px]!'>
            <SvgSpriteLoader id='arrow-down' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2>

        <TooltipV2 tooltipBody='Move to Previous Run'>
          <Button variant={'outline'} size={'icon'} className='size-6! px-3! py-1! mt-[2.5px]!'>
            <SvgSpriteLoader id='arrow-up' height={14} width={14} color={COLORS.GRAY_1000} />
          </Button>
        </TooltipV2>
      </div>
    </div>
  );
};

export default LogTopbar;
