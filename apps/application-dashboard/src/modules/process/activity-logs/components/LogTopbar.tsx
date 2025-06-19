import type { FC } from 'react';
import TopbarStatusIcon from 'modules/process/common/TopbarStatusIcon';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetActivitySummaryQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkeletonElement from '@/components/skeletons/SkeletonElement';

const LogTopbar: FC = () => {
  const searchParams = useSearchParams();
  const activityId = useParams()?.activityId as string;
  const processId = searchParams?.get('processId') as string;

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useGetActivitySummaryQuery({
    activityRunId: activityId as string,
    processId: processId as string,
  });

  return (
    <div className='border-GRAY_100 flex h-15 w-full items-center justify-between overflow-x-auto border-b [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <CommonWrapper
        className='flex min-w-max items-center justify-center gap-x-2 p-4'
        isLoading={isLoadingSummary || isErrorSummary}
        loader={
          <div className='flex items-center gap-x-2'>
            <SkeletonElement className='h-6 w-20 rounded-full' />
            <SkeletonElement className='h-6 w-20 rounded-full' />
          </div>
        }
        skeletonType={SkeletonTypes.CUSTOM}
      >
        {summaryData?.summary?.header && (
          <div className='flex items-center gap-x-1'>
            <span className='f-13-550 text-GRAY_700 capitalize'>{summaryData?.summary?.header?.key}</span>
            <span className='f-13-550 text-GRAY_1000'>{summaryData?.summary?.header?.value || '---'}</span>
          </div>
        )}

        {summaryData?.summary?.status && (
          <div className='border-GRAY_400 bg-BG_GRAY_2 flex items-center gap-x-1.5 rounded-full border px-2 py-1'>
            <TopbarStatusIcon
              status={summaryData?.summary?.status as ACTIVITY_RUN_STATUS}
              fillColor={
                STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor
              }
              strokeColor={
                STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon
                  ?.strokeColor
              }
            />
            <span className='f-12-450 text-GRAY_1000'>
              {STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.label}
            </span>
          </div>
        )}
      </CommonWrapper>
    </div>
  );
};

export default LogTopbar;
