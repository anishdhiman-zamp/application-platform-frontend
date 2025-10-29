import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { IServerSideGetRowsRequest } from 'ag-grid-community';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn, getCommaSeparatedNumber, snakeCaseToSentenceCase } from 'utils/common';
import { useGetActivityRunsSummaryQuery, useGetFilterConfigByProcessIdQuery } from '@/apis/processes';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import { PERSISTENT_FILTER_ID } from '@/hooks/usePersistFilters';
import { ColumnOrderingVisibilityType } from '@/modules/data/data.types';
import { getColumnOrderingVisibilityForCurrentDataset } from '@/modules/data/data.utils';
import ActivityByStatus from '@/modules/process/activity-runs/ActivityByStatus';
import { DisplayOptionProvider } from '@/modules/process/activity-runs/contextWrapper/DisplayOptionContext';
import TabStatusIcon from '@/modules/process/common/TabStatusIcon';
import NoWidgetData from '@/modules/widgets/components/NoWidgetData';
import type { MapAny } from '@/types/commonTypes';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

interface ProcessByIdProps {
  processId: string;
  status?: string;
}

const ProcessById: FC<ProcessByIdProps> = ({ processId, status }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLoadDone = useRef(false);
  const {
    state: { selectedFilters, isFilterInitialized },
    dispatch,
  } = useFiltersContextStore();
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<string>(status || '');

  const {
    data: activityRunsSummaryData,
    isError: isActivityRunsSummaryError,
    isLoading: isActivityRunsSummaryLoading,
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
      skip: !processId || isOrgSwitchIsInProgress || !isFilterInitialized,
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: filterConfigData,
    isLoading: isFilterConfigLoading,
    isError: isFilterConfigError,
    refetch: refetchFilterConfig,
  } = useGetFilterConfigByProcessIdQuery(
    {
      processId: processId as string,
    },
    {
      skip: !processId || isOrgSwitchIsInProgress,
    },
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams?.toString() || '');

    params.set('status', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getTotalCountForStatus = (status: string): number => {
    return activityRunsSummaryData?.status_summary?.find((item) => item?.status === status)?.count ?? 0;
  };

  // Get initial column preferences from localStorage for shared state
  const initialColumnPreferences = useMemo(() => {
    return getColumnOrderingVisibilityForCurrentDataset(processId as string) ?? [];
  }, [processId]);

  const initialColumnOrder = useMemo(() => {
    if (initialColumnPreferences.length > 0)
      return initialColumnPreferences.map((column: ColumnOrderingVisibilityType) => column?.colId);

    return [];
  }, [initialColumnPreferences]);

  const initialColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};

    initialColumnPreferences.forEach((column: ColumnOrderingVisibilityType) => {
      visibility[column?.colId] = !!column?.isVisible;
    });

    return visibility;
  }, [initialColumnPreferences]);

  const refetchConditionalSummaryOrFilterConfigApi = () => {
    if (isActivityRunsSummaryError) {
      refetchActivityRunsSummary();
    } else if (isFilterConfigError) {
      refetchFilterConfig();
    }
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

  useEffect(() => {
    initialLoadDone.current = false;
  }, [processId]);

  // Initialize filters on component mount
  useEffect(() => {
    if (!isFilterInitialized && processId) {
      // Set persist ID for this process
      dispatch({
        type: filtersContextActions.SET_PERSIST_ID,
        payload: { persistId: `${PERSISTENT_FILTER_ID.PROCESS}_${processId}` },
      });

      // Load filters from localStorage
      dispatch({
        type: filtersContextActions.GET_FILTERS_FROM_STORAGE,
        payload: { persistId: `${PERSISTENT_FILTER_ID.PROCESS}_${processId}` },
      });
    }
  }, [processId, isFilterInitialized, dispatch]);

  useEffect(() => {
    if (filterConfigData?.data?.length && !isFilterConfigLoading) {
      dispatch({
        type: filtersContextActions.SET_FILTERS_CONFIG,
        payload: {
          filtersConfig: filterConfigData?.data
            ?.filter(
              (item: MapAny) =>
                !item?.metadata?.is_hidden &&
                item?.metadata?.custom_type !== CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS &&
                item?.metadata?.custom_type !== CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS,
            )
            ?.map((column: MapAny) => ({
              key: column?.column,
              label: snakeCaseToSentenceCase(column?.column),
              values: column?.options,
              type: column?.type,
            })),
        },
      });
    }
  }, [filterConfigData?.data, dispatch, isFilterConfigLoading]);

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isActivityRunsSummaryLoading || isFilterConfigLoading,
      })}
      isError={isActivityRunsSummaryError || isFilterConfigError}
      refetchFunction={refetchConditionalSummaryOrFilterConfigApi}
      isLoading={isActivityRunsSummaryLoading || isFilterConfigLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      isNoData={activityRunsSummaryData?.status_summary?.length === 0}
      noDataBanner={<NoWidgetData className='h-[400px]' text='No activity runs found' />}
      loader={
        <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      <DisplayOptionProvider
        processId={processId}
        initialVisibility={initialColumnVisibility}
        initialOrder={initialColumnOrder}
      >
        <div className='h-full w-full'>
          {/* custom tab navigation */}
          <div data-testid='activity-runs-status-tabs-group' className='mx-3 my-3 flex gap-2.5 bg-white'>
            {activityRunsSummaryData?.status_summary?.map((item) => (
              <button
                data-testid={`activity-runs-status-tab-${item?.status}`}
                key={item?.status}
                onClick={() => handleTabChange(item?.status)}
                className={cn(
                  'hover:bg-GRAY_50 flex cursor-pointer items-center gap-1.5 rounded-sm border-none px-2 py-1 transition-colors',
                  {
                    'bg-GRAY_100': activeTab === item?.status,
                    'bg-transparent': activeTab !== item?.status,
                  },
                )}
              >
                <TabStatusIcon
                  status={item?.status as ACTIVITY_RUN_STATUS}
                  fillColor={STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor}
                  strokeColor={
                    STATUS_ICON_COLOR_MAPPING[item?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor
                  }
                />
                <span className={cn('f-12-500 text-GRAY_900', { 'text-GRAY_1000': activeTab === item?.status })}>
                  {snakeCaseToSentenceCase(item?.status?.toLowerCase())}
                </span>
                <span className={cn('f-12-500 text-GRAY_600', { 'text-GRAY_1000': activeTab === item?.status })}>
                  {getCommaSeparatedNumber(item?.count)}
                </span>
              </button>
            ))}
          </div>

          {/* ActivityByStatus tables - always remain mounted */}
          <div className='relative w-full' style={{ height: 'calc(100vh - 200px)' }}>
            {activityRunsSummaryData?.status_summary?.map((item) => (
              <div
                key={`id-${item?.status}`}
                className={cn('absolute inset-0 h-full w-full', {
                  'pointer-events-auto opacity-100': activeTab === item?.status,
                  'pointer-events-none opacity-0': activeTab !== item?.status,
                })}
              >
                <ActivityByStatus
                  processId={processId}
                  status={item?.status}
                  totalCount={getTotalCountForStatus(item?.status)}
                />
              </div>
            ))}
          </div>
        </div>
      </DisplayOptionProvider>
    </CommonWrapper>
  );
};

export default withFiltersContext(ProcessById);
