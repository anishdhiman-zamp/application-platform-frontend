import React, { FC, useMemo, useState } from 'react';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from 'apis/widgets';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES, WIDGET_LOADER } from 'constants/icons';
import { AG_CHART_THEME } from 'modules/widgets/AgTheme';
import { AG_CHART_AXES, AG_CHART_LEGEND_CONFIG } from 'modules/widgets/widgets.constant';
import { getChartOptions, groupTransactionsByDate, transformData } from 'modules/widgets/widgets.utils';
import Image from 'next/image';
import { WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { formatNumber, getMaxValue } from 'utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

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
  const [stackedValues, setStackedValues] = useState<MapAny[]>([]);
  const [maxValue, setMaxValue] = useState<number>(0);
  const { data: widgetData, isLoading } = useGetWidgetDataQuery(
    { widgetId: widgetDetails.widget_instance_id, filters: currentPageFilters },
    { refetchOnMountOrArgChange: true, skip: !isFilterInitialized },
  );
  const transformedData = useMemo(() => {
    const data = widgetData?.result ? transformData(widgetData?.result) : [];

    if (
      (widgetDetails.widget_type === WIDGET_TYPES.BAR_CHART || widgetDetails.widget_type === WIDGET_TYPES.LINE_CHART) &&
      widgetDetails?.data_mappings?.mappings[0]?.fields?.group_by?.length
    ) {
      const axis = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.y_axis?.[0];

      setMaxValue(getMaxValue(data?.[0] ?? [], [axis?.column]) ?? '');

      const mappings = widgetDetails?.data_mappings?.mappings[0];
      const groupedData = groupTransactionsByDate(
        data[0],
        mappings?.fields?.group_by?.[0]?.column ?? '',
        mappings?.fields?.x_axis?.[0]?.column ?? '',
        mappings?.fields?.y_axis?.[0]?.column ?? '',
      );

      setStackedValues(groupedData?.groupValues.map((value) => ({ column: value })));

      return [groupedData.data];
    }

    return data;
  }, [widgetData]);

  const yAxisTitle = useMemo(() => {
    if (widgetDetails.widget_type !== WIDGET_TYPES.BAR_CHART && widgetDetails.widget_type !== WIDGET_TYPES.LINE_CHART)
      return '';
    const axis = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.y_axis?.[0];

    return `${axis?.column} (${axis?.aggregation}), in ${formatNumber(maxValue, 0, true, true)}`;
  }, [widgetDetails, transformedData, maxValue]);

  const chartOptions = useMemo(() => {
    const baseOptions = {
      theme: AG_CHART_THEME,
      data: transformedData?.[0] ?? [],
      legend: AG_CHART_LEGEND_CONFIG,
      animation: { enabled: true },
      axes: AG_CHART_AXES,
    } as AgChartOptions;

    return getChartOptions(widgetDetails, onNodeClick, baseOptions, stackedValues);
  }, [widgetDetails, onNodeClick, transformedData, stackedValues]);

  return (
    <div className=' bg-white h-full border border-GRAY_400 rounded-xl px-6 py-4.5 overflow-hidden'>
      <div className='f-18-450 text-GRAY_1000 mb-10'>{widgetDetails?.title}</div>
      <CommonWrapper
        isLoading={isLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        isNoData={!transformedData?.[0]?.length}
        className='h-full'
        noDataBanner={
          <div className='top-0 right-0 w-full h-[calc(100%-100px)] flex justify-center items-center z-1000 bg-white'>
            <div className='flex items-center flex-col gap-3'>
              <SvgSpriteLoader
                id='coins-stacked-03'
                iconCategory={ICON_SPRITE_TYPES.FINANCE_AND_ECOMMERCE}
                width={24}
                height={24}
                color={COLORS.GRAY_700}
              />
              <div className='text-GRAY_700 f-12-450'>No data available, try again with different filters</div>
            </div>
          </div>
        }
        loader={
          <div className='top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white'>
            <Image src={WIDGET_LOADER} alt='widget-loader' width={300} height={300} />
          </div>
        }
      >
        {chartOptions && (
          <div className='h-full w-full relative'>
            {isLoading &&
              (widgetDetails.widget_type === WIDGET_TYPES.BAR_CHART ||
                widgetDetails.widget_type === WIDGET_TYPES.LINE_CHART) && (
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
