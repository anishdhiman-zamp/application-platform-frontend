import { FC, useMemo } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { WIDGET_LOADER } from 'constants/lottie/widget-loader';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { AG_CHART_LEGEND_CONFIG, DEFAULT_TRANSFORMED_DATA } from 'modules/widgets/widgets.constant';
import { getChartOptions, getTransformedData } from 'modules/widgets/widgets.utils';
import {
  type DrillDownConfigType,
  type FieldsMappingType,
  type PieDonutChartFieldsMappingType,
  WIDGET_TYPES,
  WidgetInstanceType,
} from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
interface WidgetsWrapperProps {
  widgetDetails: Extract<
    WidgetInstanceType,
    {
      widget_type: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART | WIDGET_TYPES.PIE_CHART | WIDGET_TYPES.DONUT_CHART;
    }
  >;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  onNodeClick: (
    clickedNode: MapAny,
    xAxis: string,
    datasetId: string,
    datasetDefaultFilters: string,
    drilldown_config?: DrillDownConfigType,
    fields?: FieldsMappingType | PieDonutChartFieldsMappingType,
  ) => void;
  periodicity: string;
  timeColumns: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
  currency: string;
  defaultCurrency: string;
  activeWidget: string;
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
        time_columns: timeColumns,
        periodicity: (periodicity as PERIODICITY_TYPES) ?? PERIODICITY_TYPES.DAILY,
        currency: currency,
      },
    },
    { refetchOnMountOrArgChange: false, skip: !isFilterInitialized },
  );

  const { transformedData, stackedValues, yAxisTitle, donutOthersData, maxValueLength, showCurrency } = useMemo(() => {
    return widgetData?.result
      ? getTransformedData(widgetData?.result, widgetDetails, defaultCurrency ?? widgetData?.currency)
      : DEFAULT_TRANSFORMED_DATA;
  }, [widgetData]);

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
      transformedData?.length,
      donutOthersData,
      periodicity as PERIODICITY_TYPES,
    );
  }, [widgetDetails, transformedData, stackedValues]);

  return (
    <div
      className={cn('border-GRAY_400 py-4.5 h-full overflow-hidden rounded-xl border bg-white', {
        'animate-pulse opacity-85': isFetching,
      })}
    >
      <WidgetTitle
        title={widgetDetails?.title}
        groupWidgetsOptions={groupWidgetsOptions}
        onWidgetChange={onWidgetChange}
        widgetType={widgetType}
        activeWidget={activeWidget}
        className='z-1000!'
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
          <div className='z-100 absolute left-0 top-0 flex h-full w-full items-center justify-center'>
            <DynamicLottiePlayer src={WIDGET_LOADER} className='lottie-player h-[150px]' autoplay loop keepLastFrame />
          </div>
        }
      >
        {chartOptions && (
          <div className='relative h-full w-full'>
            {!widgetDetails?.display_config?.hide_y_axis_title && yAxisTitle && (
              <div className='text-GRAY_700 f-12-450 absolute -top-10 right-5 z-10'>
                {snakeCaseToSentenceCase(yAxisTitle)}
                <div
                  className='h-4.5 bg-GRAY_200 ml-auto mt-2 w-px'
                  style={{ marginRight: `${maxValueLength * 5.5}px` }}
                ></div>
              </div>
            )}
            <AgCharts options={chartOptions as AgChartOptions} />
          </div>
        )}
      </CommonWrapper>
    </div>
  );
};

export default AGChartsWidgets;
