import { FC, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { IServerSideGetRowsRequest } from 'ag-grid-community';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import { useGetActivityRunsSummaryQuery, useGetFilterConfigByProcessIdQuery } from '@/apis/processes';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ActivityByStatus from '@/modules/process/activity-runs/ActivityByStatus';
import TabStatusIcon from '@/modules/process/common/TabStatusIcon';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import { useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type ProcessByIdProps = {
  processId: string;
};

const ProcessById: FC<ProcessByIdProps> = ({ processId }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const initialLoadDone = useRef(false);

  const {
    state: { selectedFilters },
  } = useFiltersContextStore();

  const {
    data: activityRunsSummaryData,
    isError,
    isLoading,
    refetch: refetchActivityRunsSummary,
  } = useGetActivityRunsSummaryQuery(
    {
      processId: processId as string,
      query_config: getEncodedRequest(
        {
          filterModel: {
            ...selectedFilters,
          },
        } as IServerSideGetRowsRequest,
        undefined,
      ),
    },
    { skip: !processId },
  );

  const {
    data: filterConfigData,
    refetch: refetchFilterConfig,
    isLoading: isFilterConfigLoading,
    isError: isFilterConfigError,
    isUninitialized: isFilterConfigUninitialized,
  } = useGetFilterConfigByProcessIdQuery(
    {
      processId: processId as string,
    },
    {
      skip: !processId,
      refetchOnMountOrArgChange: false,
    },
  );

  useEffect(() => {
    const statusSummary = activityRunsSummaryData?.status_summary;

    if (statusSummary && statusSummary?.length > 0 && !initialLoadDone.current) {
      setActiveTab(statusSummary[0]?.status);
      initialLoadDone.current = true;
    }
  }, [activityRunsSummaryData]);

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isLoading,
      })}
      isError={isError}
      refetchFunction={refetchActivityRunsSummary}
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-50 bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      <Tabs
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        defaultValue={activityRunsSummaryData?.status_summary?.[0]?.status}
      >
        <TabsList className='mx-3 my-3 gap-2.5 bg-white'>
          {activityRunsSummaryData?.status_summary?.map((item) => (
            <TabsTrigger
              key={item?.status}
              value={item?.status}
              className={cn(
                '!rounded-[4px] !px-2 !py-1 border-none gap-1.5 transition-colors hover:bg-GRAY_50 active:bg-GRAY_200',
                {
                  '!bg-GRAY_100': activeTab === item?.status,
                },
              )}
            >
              <TabStatusIcon
                status={item?.status as ACTIVITY_RUN_STATUS}
                fillColor={STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor}
                strokeColor={STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor}
              />
              <span className='f-12-500 text-GRAY_1000'>{snakeCaseToSentenceCase(item?.status?.toLowerCase())}</span>
              <span className='f-12-500 text-GRAY_1000'>{item?.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <ActivityByStatus
            processId={processId}
            status={activeTab}
            filterConfigData={filterConfigData}
            isFilterConfigLoading={isFilterConfigLoading}
            isFilterConfigError={isFilterConfigError}
            isFilterConfigUninitialized={isFilterConfigUninitialized}
            refetchFilterConfig={refetchFilterConfig}
          />
        </TabsContent>
      </Tabs>
    </CommonWrapper>
  );
};

export default withFiltersContext(ProcessById);
