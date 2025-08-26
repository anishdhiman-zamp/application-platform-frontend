import { FC, useMemo } from 'react';
import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { WIDGET_LOADER } from 'constants/lottie/widget-loader';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { ResizeProps, WidgetNodeClickParams } from 'modules/widgets/widget.types';
import { AG_CHART_LEGEND_CONFIG, DEFAULT_TRANSFORMED_DATA } from 'modules/widgets/widgets.constant';
import { getChartOptions, getTimeColumns, getTransformedData } from 'modules/widgets/widgets.utils';
import { WidgetDataType, WidgetInstanceType } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import { useWidgetLoadTime } from '@/hooks/useLayoutEffect';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceType;
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
}) => {
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

  useWidgetLoadTime(
    `${widgetDetails.widget_instance_id}-${currentPageFilters}-${periodicity}`,
    isFetching,
    isLoading || isFilterLoading,
    transformedData?.length > 0,
  );

  return (
    <div className='group relative'>
      <div
        className={cn('border-GRAY_400 h-full overflow-hidden bg-white py-4.5', {
          'animate-pulse opacity-85': isFetching,
          'rounded-xl border pt-2.5': !isPlayground,
        })}
      >
        <WidgetTitle
          title={widgetDetails?.title}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          widgetType={widgetType}
          activeWidget={activeWidget}
          className='z-1000!'
          resizeProps={resizeProps}
        />
        <CommonWrapper
          isLoading={isLoading || isFilterLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          isNoData={!transformedData?.length}
          className='h-full'
          noDataBanner={<NoWidgetData className={cn({ 'animate-pulse opacity-100': isFetching })} />}
          isError={isError}
          refetchFunction={refetch}
          loader={
            <div className='absolute top-0 left-0 z-100 flex h-full w-full items-center justify-center'>
              <DynamicLottiePlayer
                src={WIDGET_LOADER}
                className='lottie-player h-[150px]'
                autoplay
                loop
                keepLastFrame
              />
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
    </div>
  );
};

export default AGChartsWidgets;
