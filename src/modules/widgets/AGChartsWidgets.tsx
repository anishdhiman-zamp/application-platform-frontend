import React, { FC, useMemo } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { WIDGET_LOADER } from 'constants/icons';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { AG_CHART_LEGEND_CONFIG } from 'modules/widgets/widgets.constant';
import { getChartOptions, getTransformedData } from 'modules/widgets/widgets.utils';
import Image from 'next/image';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
interface WidgetsWrapperProps {
  widgetDetails: Extract<
    WidgetInstanceType,
    {
      widget_type: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART | WIDGET_TYPES.PIE_CHART | WIDGET_TYPES.DONUT_CHART;
    }
  >;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  onNodeClick: (clickedNode: MapAny, xAxis: string) => void;
  periodicity: string;
  timeColumns: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
  currency: string;
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
}) => {
  const widgetType = widgetDetails?.widget_type;
  const {
    data: widgetData,
    isLoading,
    isError,
    refetch,
  } = useGetWidgetDataQuery(
    {
      widgetId: widgetDetails.widget_instance_id,
      payload: {
        filters: currentPageFilters,
        time_column: timeColumns,
        periodicity: (periodicity as PERIODICITY_TYPES) ?? PERIODICITY_TYPES.DAILY,
        currency: currency,
      },
    },
    { refetchOnMountOrArgChange: false, skip: !isFilterInitialized },
  );

  const { transformedData, stackedValues, yAxisTitle, donutOthersData, maxValueLength } = useMemo(() => {
    return widgetData?.result
      ? getTransformedData(widgetData?.result, widgetDetails, widgetData?.currency)
      : { transformedData: [], stackedValues: [], donutOthersData: [], yAxisTitle: '', maxValueLength: 0 };
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
      currency,
      stackedValues,
      transformedData?.length,
      donutOthersData,
      periodicity as PERIODICITY_TYPES,
    );
  }, [widgetDetails, transformedData, stackedValues]);

  return (
    <div className=' bg-white h-full border border-GRAY_400 rounded-xl py-4.5 overflow-hidden'>
      <WidgetTitle
        title={widgetDetails?.title}
        groupWidgetsOptions={groupWidgetsOptions}
        onWidgetChange={onWidgetChange}
        widgetType={widgetType}
      />
      <CommonWrapper
        isLoading={isLoading || isFilterLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        isNoData={!transformedData?.length}
        className='h-full'
        noDataBanner={<NoWidgetData />}
        isError={isError}
        refetchFunction={refetch}
        loader={
          <div className='top-0 -mt-5 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
            <Image src={WIDGET_LOADER} unoptimized alt='widget-loader' width={150} height={150} />
          </div>
        }
      >
        {chartOptions && (
          <div className='h-full w-full relative'>
            {yAxisTitle && (
              <div className='absolute -top-10 right-5 z-10 text-GRAY_700 f-12-450'>
                {yAxisTitle}
                <div
                  className='w-px h-4.5 bg-GRAY_200 ml-auto mt-2'
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
