import React, { FC, useMemo } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { WIDGET_LOADER } from 'constants/icons';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import { AG_CHART_AXES, AG_CHART_LEGEND_CONFIG } from 'modules/widgets/widgets.constant';
import { getChartOptions, getTransformedData } from 'modules/widgets/widgets.utils';
import Image from 'next/image';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
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
}

const AGChartsWidgets: FC<WidgetsWrapperProps> = ({
  widgetDetails,
  currentPageFilters,
  isFilterInitialized,
  onNodeClick,
}) => {
  const { data: widgetData, isLoading } = useGetWidgetDataQuery(
    { widgetId: widgetDetails.widget_instance_id, filters: currentPageFilters },
    { refetchOnMountOrArgChange: true, skip: !isFilterInitialized },
  );

  const { transformedData, stackedValues, yAxisTitle } = useMemo(() => {
    return widgetData?.result
      ? getTransformedData(widgetData?.result, widgetDetails)
      : { transformedData: [], stackedValues: [] };
  }, [widgetData]);

  const chartOptions = useMemo(() => {
    const baseOptions = {
      theme: AG_CHART_THEME,
      data: transformedData ?? [],
      legend: AG_CHART_LEGEND_CONFIG,
      animation: { enabled: true },
      axes: AG_CHART_AXES,
    } as AgChartOptions;

    return getChartOptions(widgetDetails, onNodeClick, baseOptions, stackedValues, transformedData?.length);
  }, [widgetDetails, onNodeClick, transformedData, stackedValues]);

  return (
    <div className=' bg-white h-full border border-GRAY_400 rounded-xl px-6 py-4.5 overflow-hidden'>
      <div className='f-18-450 text-GRAY_1000 mb-10'>{widgetDetails?.title}</div>
      <CommonWrapper
        isLoading={isLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        isNoData={!transformedData?.length}
        className='h-full'
        noDataBanner={<NoWidgetData />}
        loader={
          <div className='top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
            <Image src={WIDGET_LOADER} unoptimized alt='widget-loader' width={300} height={300} />
          </div>
        }
      >
        {chartOptions && (
          <div className='h-full w-full relative'>
            {yAxisTitle && (
              <div className='absolute -top-10 right-5 z-10 text-GRAY_700 f-12-450'>
                {yAxisTitle}
                <div className='w-px h-4.5 bg-GRAY_200 ml-auto mt-2'></div>
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
