import React, { FC, useMemo } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { COLORS } from 'constants/colors';
import { AG_CHART_AXES, AG_CHART_LEGEND_CONFIG, WIDGET_TYPES } from 'modules/widgets/widgets.constant';
import { getChartConfig, transformData } from 'modules/widgets/widgets.utils';
import { WidgetInstanceType } from 'types/api/pagesApi.types';
import ProgressBar from 'components/common/RingProgress';

interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceType;
  widgetType: WIDGET_TYPES;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
}

const AGChartsWidgets: FC<WidgetsWrapperProps> = ({
  widgetDetails,
  widgetType,
  currentPageFilters,
  isFilterInitialized,
}) => {
  const { data: widgetData, isLoading } = useGetWidgetDataQuery(
    { widgetId: widgetDetails.widget_instance_id, filters: currentPageFilters },
    { refetchOnMountOrArgChange: true, skip: !isFilterInitialized },
  );

  const chartConfig = useMemo(() => {
    return getChartConfig(widgetDetails, widgetType);
  }, [widgetDetails]);

  const transformedData = useMemo(() => {
    return widgetData?.result ? transformData(widgetData?.result) : [];
  }, [widgetData]);

  const options: AgChartOptions = {
    series: chartConfig?.series,
    data: transformedData[0] ?? [],
    legend: AG_CHART_LEGEND_CONFIG,
    axes: AG_CHART_AXES,
    animation: {
      enabled: true,
    },
  };

  return (
    <div className='relative bg-white h-full border border-GRAY_400 rounded-xl px-6 py-4.5 overflow-hidden'>
      <div className='f-18-450 text-GRAY_1000 mb-4'>{widgetDetails.title}</div>
      {isLoading && (
        <div className='absolute top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
          <ProgressBar
            trackColor={COLORS.BLACK}
            indicatorColor={COLORS.WHITE}
            indicatorWidth={10}
            trackWidth={5}
            className='animate-spin'
            size={100}
            progress={30}
          />
        </div>
      )}
      <AgCharts options={options} />
    </div>
  );
};

export default AGChartsWidgets;
