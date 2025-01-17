import React, { FC, useMemo, } from "react";
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from "apis/widgets";
import { COLORS } from "constants/colors";
import { WIDGET_TYPES } from 'modules/widgets/widgets.constant';
import { getChartConfig, transformData } from 'modules/widgets/widgets.utils';
import { WidgetInstanceType } from "types/api/pagesApi.types";
import ProgressBar from "components/common/RingProgress";

interface WidgetsWrapperProps {
    widgetDetails: WidgetInstanceType;
    widgetType: WIDGET_TYPES;
}

const AGChartsWidgets: FC<WidgetsWrapperProps> = ({ widgetDetails, widgetType }) => {
    const { data: widgetData, isLoading } = useGetWidgetDataQuery({ widgetId: widgetDetails.widget_instance_id }, { refetchOnMountOrArgChange: false })

    const chartConfig = useMemo(() => {
        return getChartConfig(widgetDetails, widgetType)
    }, [widgetDetails])


    const transformedData = useMemo(() => {
        return widgetData?.result ? transformData(widgetData?.result) : []
    }, [widgetData])

    return (
        <div className='relative bg-white h-full border border-GRAY_400 rounded-xl px-6 py-4.5 overflow-hidden'>
            <div className='f-18-450 text-GRAY_1000 mb-4'>{widgetDetails.title}</div>
            {isLoading && <div className="absolute top-0 right-0 h-full w-full flex justify-center items-center z-1000 bg-white">
                <ProgressBar
                    trackColor={COLORS.BLACK}
                    indicatorColor={COLORS.WHITE}
                    indicatorWidth={10}
                    trackWidth={5}
                    className='animate-spin'
                    size={100}
                    progress={30}
                />
            </div>}
            <AgCharts options={{
                series: chartConfig.series,
                data: transformedData[0],
                listeners: {
                    seriesNodeClick: (event: any) => {
                        console.log('seriesNodeClick', event);
                    },
                },
                legend: {
                    enabled: true,
                    position: 'top',
                    item: {
                        marker: {
                            size: 8, // Marker size: 8px by 8px
                            shape: 'square', // Shape to allow rounded corners
                            strokeWidth: 0, // Remove border
                        },
                        label: {
                            fontSize: 12,
                            fontWeight: 450,
                            fontFamily: 'Inter',
                            color: COLORS.GRAY_900,
                        },
                    },
                },
                axes: [
                    {
                        type: 'category',
                        position: 'bottom',
                    },
                    {
                        type: 'number',
                        position: 'right',
                    },
                ],
                animation: {
                    enabled: true,
                },
            }} />
        </div>
    )
}

export default AGChartsWidgets;