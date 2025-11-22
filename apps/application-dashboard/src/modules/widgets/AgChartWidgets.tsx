import { FC, useMemo, useState } from 'react';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import DeleteWidgetDialog from 'modules/widgets/components/DeleteWidgetDialog';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { ResizeProps, WidgetNodeClickParams } from 'modules/widgets/widget.types';
import WidgetOptions from 'modules/widgets/WidgetOptions';
import { AG_CHART_LEGEND_CONFIG, DEFAULT_TRANSFORMED_DATA } from 'modules/widgets/widgets.constant';
import { getChartOptions, getTimeColumns, getTransformedData } from 'modules/widgets/widgets.utils';
import { useParams } from 'next/navigation';
import { WidgetDataType, WidgetInstanceTypeWrapper } from 'types/api/widgets.types';
import { OptionsType, ResponsiveGridLayoutType } from 'types/commonTypes';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { WIDGET_LOADER_SVG } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import { useWidgetLoadTime } from '@/hooks/useLayoutEffect';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceTypeWrapper;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  onNodeClick: (params: WidgetNodeClickParams) => void;
  periodicity: string;
  timeColumns: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
  currency: string;
  defaultCurrency: string;
  activeWidget: string;
  previewData?: WidgetDataType[];
  isPlayground?: boolean;
  resizeProps?: ResizeProps;
  currentWidgetLayout?: ResponsiveGridLayoutType;
}

const AGChartsWidgets: FC<WidgetsWrapperProps> = ({
  widgetDetails,
  currentPageFilters,
  isFilterInitialized,
  onNodeClick,
  periodicity,
  timeColumns,
  groupWidgetsOptions,
  onWidgetChange,
  isFilterLoading,
  currency,
  activeWidget,
  defaultCurrency,
  previewData,
  isPlayground,
  resizeProps,
  currentWidgetLayout,
}) => {
  const params = useParams();
  const pageId = params?.pageId as string;
  const selectedDatasetIds = useAppSelector((state) => state.sheetFilters.selectedDatasetIds);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const widgetType = widgetDetails?.widget_type;

  const {
    data: widgetData,
    isFetching,
    isError,
    isLoading,
    refetch,
  } = useGetWidgetDataQuery(
    {
      widgetId: widgetDetails.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_columns: timeColumns || getTimeColumns(widgetDetails),
        periodicity: (periodicity as PERIODICITY_TYPES) ?? PERIODICITY_TYPES.DAILY,
        currency: currency,
      },
    },
    { refetchOnMountOrArgChange: false, skip: !isFilterInitialized || isPlayground },
  );

  const { transformedData, stackedValues, yAxisTitle, donutOthersData, maxValueLength, showCurrency } = useMemo(() => {
    const chartData = isPlayground ? previewData : widgetData?.result;

    return chartData
      ? getTransformedData(chartData, widgetDetails, defaultCurrency ?? widgetData?.currency)
      : DEFAULT_TRANSFORMED_DATA;
  }, [widgetData, isPlayground, previewData, defaultCurrency]);

  const chartOptions = useMemo(() => {
    const baseOptions = {
      theme: AG_CHART_THEME,
      data: transformedData ?? [],
      legend: AG_CHART_LEGEND_CONFIG,
      animation: { enabled: true },
    } as AgChartOptions;

    return getChartOptions(
      widgetDetails,
      onNodeClick,
      baseOptions,
      showCurrency ? currency : '',
      stackedValues,
      transformedData?.length ?? 0,
      donutOthersData,
      periodicity as PERIODICITY_TYPES,
    );
  }, [widgetDetails, transformedData, stackedValues]);

  const isDatasetSelected = useMemo(
    () => selectedDatasetIds?.includes(widgetDetails?.data_mappings?.mappings?.[0]?.dataset_id),
    [selectedDatasetIds, widgetDetails],
  );

  useWidgetLoadTime(
    `${widgetDetails.widget_instance_id}-${currentPageFilters}-${periodicity}`,
    isFetching,
    isLoading || isFilterLoading,
    transformedData?.length > 0,
  );

  return (
    <div className='group relative h-full'>
      {!isPlayground && (
        <PermissionGuard resourceType={ResourceType.PAGE} resourceId={pageId} privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}>
          <WidgetOptions
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            widgetDetails={widgetDetails}
            currentWidgetLayout={currentWidgetLayout}
          />
        </PermissionGuard>
      )}
      <div
        className={cn('border-GRAY_400 h-full overflow-hidden bg-white py-4.5', {
          'animate-pulse opacity-85': isFetching,
          'rounded-xl border pt-2.5': !isPlayground,
          'shadow-chart-highlight': isDatasetSelected,
        })}
        data-testid={`${widgetDetails.widget_instance_id}-ag-charts-widgets`}
      >
        <WidgetTitle
          title={widgetDetails?.title}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          widgetType={widgetType}
          activeWidget={activeWidget}
          className='z-1000!'
          resizeProps={resizeProps}
          isLoading={isLoading || isFilterLoading}
          isNoData={!transformedData?.length}
        />
        <CommonWrapper
          isLoading={isLoading || isFilterLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          isNoData={!transformedData?.length}
          noDataBanner={<NoWidgetData className={cn({ 'animate-pulse opacity-100': isFetching }, 'h-full')} />}
          isError={isError}
          refetchFunction={refetch}
          className='h-[calc(100%-12px)]'
          loader={
            <div className='flex h-full w-full items-center justify-center'>
              <img src={WIDGET_LOADER_SVG} alt='widget loader' className='h-[150px]' />
            </div>
          }
        >
          {chartOptions && (
            <div className='relative h-full w-full'>
              {!widgetDetails?.display_config?.hide_y_axis_title && yAxisTitle && (
                <div className='text-GRAY_700 f-12-450 absolute -top-10 right-5 z-10'>
                  {snakeCaseToSentenceCase(yAxisTitle)}
                  <div
                    className='bg-GRAY_200 mt-2 ml-auto h-4.5 w-px'
                    style={{ marginRight: `${maxValueLength * 5.5}px` }}
                  ></div>
                </div>
              )}
              <AgCharts options={chartOptions as AgChartOptions} />
            </div>
          )}
        </CommonWrapper>
      </div>
      <DeleteWidgetDialog
        widgetId={widgetDetails.widget_instance_id}
        widgetTitle={widgetDetails?.title}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default AGChartsWidgets;
