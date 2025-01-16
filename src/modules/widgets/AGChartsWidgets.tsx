import React, { FC, useMemo, } from "react";
import { AgCharts } from 'ag-charts-react';
import { useGetWidgetDataQuery } from "apis/widgets";
import { barGraphInstance } from "constants/dummyData";
import { WidgetInstanceType } from "types/api/pagesApi.types";

interface WidgetsWrapperProps {
    widgetDetails: WidgetInstanceType;
}

const AGChartsWidgets: FC<WidgetsWrapperProps> = ({ widgetDetails }) => {
    const { data: widgetData } = useGetWidgetDataQuery({ widgetId: widgetDetails.widget_instance_id }, { refetchOnMountOrArgChange: false })

    const chartConfig = useMemo(() => {
        const mappings = widgetDetails?.data_mappings?.mappings
        const xAxis = mappings?.x_axis?.column || ''
        const series = [{
            type: 'bar' as const,
            xKey: xAxis,
            yKey: `${mappings?.y_axis?.aggregation}_${mappings?.y_axis?.column}`,
            yName: mappings?.y_axis?.column || '',
            stacked: true,
        }]
        const title = barGraphInstance.title

        return {
            series,
            title,
        }
    }, [widgetDetails])

    return (
        <div className='bg-white h-full border border-[#E8E8E8] rounded-xl p-6'>
            <div className='f-18-500 text-GRAY_1000 mb-4'>{widgetDetails.title}</div>
            <AgCharts options={{
                series: chartConfig.series,
                data: widgetData?.result[0].data,
                listeners: {
                    seriesNodeClick: (event: any) => {
                        console.log('seriesNodeClick', event);
                    },
                },
                legend: {
                    enabled: true,
                    position: 'top',
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