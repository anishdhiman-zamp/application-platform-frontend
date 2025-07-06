import { FC, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { IServerSideGetRowsRequest } from 'ag-grid-community';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn, formatNumber, snakeCaseToSentenceCase } from 'utils/common';
import { useGetActivityRunsSummaryQuery, useGetFilterConfigByProcessIdQuery } from '@/apis/processes';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ActivityByStatus from '@/modules/process/activity-runs/ActivityByStatus';
import TabStatusIcon from '@/modules/process/common/TabStatusIcon';
import NoWidgetData from '@/modules/widgets/components/NoWidgetData';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import { useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type ProcessByIdProps = {
  processId: string;
  status?: string;
};

const ProcessById: FC<ProcessByIdProps> = ({ processId, status }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(status || '');
  const initialLoadDone = useRef(false);

  useEffect(() => {
    initialLoadDone.current = false;
  }, [processId]);

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
    {
      skip: !processId,
    },
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams?.toString() || '');

    params.set('status', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (activityRunsSummaryData) {
      const statusSummary = activityRunsSummaryData?.status_summary;

      if (statusSummary && statusSummary?.length > 0 && !initialLoadDone.current) {
        if (!activeTab) {
          handleTabChange(statusSummary[0]?.status);
        }
        initialLoadDone.current = true;
      }
    }
  }, [activityRunsSummaryData]);

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isLoading || activityRunsSummaryData?.status_summary?.length === 0,
      })}
      isError={isError}
      refetchFunction={refetchActivityRunsSummary}
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={activityRunsSummaryData?.status_summary?.length === 0}
      noDataBanner={<NoWidgetData className='h-[400px]' text='No activity runs found' />}
      loader={
        <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      <Tabs onValueChange={(value) => handleTabChange(value)} value={activeTab} key={activeTab}>
        <TabsList className='mx-3 my-3 gap-2.5 bg-white'>
          {activityRunsSummaryData?.status_summary?.map((item) => (
            <TabsTrigger
              key={item?.status}
              value={item?.status}
              className={cn(
                'hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 gap-1.5 rounded-sm! border-none px-2! py-1!',
              )}
            >
              <TabStatusIcon
                status={item?.status as ACTIVITY_RUN_STATUS}
                fillColor={STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor}
                strokeColor={STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor}
              />
              <span className={cn('f-12-500 text-GRAY_900', { 'text-GRAY_1000': activeTab === item?.status })}>
                {snakeCaseToSentenceCase(item?.status?.toLowerCase())}
              </span>
              <span className={cn('f-12-500 text-GRAY_600', { 'text-GRAY_1000': activeTab === item?.status })}>
                {formatNumber(item?.count, 0, true, false, true)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab && (
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
        )}
      </Tabs>
    </CommonWrapper>
  );
};

export default withFiltersContext(ProcessById);
