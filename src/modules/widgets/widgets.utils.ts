import { AgBarSeriesOptions, AgCartesianSeriesOptions } from 'ag-charts-community';
import { AG_CHART_TYPES, WIDGET_TYPES, WidgetDataValueType, WidgetTypes, } from 'modules/widgets/widgets.constant';
import { WidgetInstanceType } from 'types/api/pagesApi.types';
import { WidgetDataType } from 'types/api/widgets.types';
import { MapAny } from "types/commonTypes";
import { LogicalOperatorType } from 'types/components/table.type';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { getConditionValues } from 'components/common/table/table.utils';
import { FilterConfigType } from 'components/filter/filter.types';

/**
 * Formats the data array based on the types specified in the columns array.
 * @param response - The response object containing columns and data.
 * @returns The formatted data array.
 */
export function transformData(responses: WidgetDataType[]) {
    return responses.map(response => {
        const { columns, data } = response;

        return data.map(row => {
            const formattedRow: MapAny = {};

            for (const column of columns) {
                const { column_name, column_type } = column;

                if (column_name in row) {
                    const value = row[column_name as keyof typeof row];

                    switch (column_type) {
                        case WidgetDataValueType.STRING:
                            formattedRow[column_name] = String(value);
                            break;
                        case WidgetDataValueType.DECIMAL:
                        case WidgetDataValueType.NUMBER:
                        case WidgetDataValueType.BIGINT:
                        case WidgetDataValueType.INT:
                        case WidgetDataValueType.SMALLINT:
                        case WidgetDataValueType.TINYINT:
                            formattedRow[column_name] = Math.abs(parseFloat(value as string) ?? 0);
                            break;
                        default:
                            formattedRow[column_name] = value ?? 0; // Leave as is for unknown types.
                    }
                }
            }

            return formattedRow;
        });
    });
}


export const getChartConfig = (widgetDetails: WidgetInstanceType, widgetType: WIDGET_TYPES) => {
    const mappings = widgetDetails?.data_mappings?.mappings
    const xAxis = mappings?.x_axis?.column || ''
    const title = widgetDetails.title
    const chartType = AG_CHART_TYPES[widgetType as unknown as keyof typeof AG_CHART_TYPES]

    const series: AgCartesianSeriesOptions[] = [{
        type: chartType,
        xKey: xAxis,
        yKey: `${mappings?.y_axis?.aggregation}_${mappings?.y_axis?.column}`,
        yName: mappings?.y_axis?.column || '',
        stacked: true,
        fill: '#8562BE',
        label: {
            enabled: true,
            fontSize: 10,
            formatter: (params: any) => {
                if ((Number(params.datum[params.yKey]) / 1000000) > 0.5)
                    return (Number(params.datum[params.yKey]) / 1000000).toFixed(1).toString();
                else
                    return '';
            }
        }
    }] as AgBarSeriesOptions<any>[]

    return {
        series,
        title,
    }
}

export const getPieChartConfig = (widgetDetails: WidgetInstanceType) => {
    const mappings = widgetDetails?.data_mappings?.mappings
    const title = widgetDetails.title

    const slices = [{
        type: AG_CHART_TYPES[WidgetTypes.PIE_CHART],
        legendItemKey: mappings?.slices?.column,
        angleKey: mappings?.values?.aggregation ? `${mappings?.values?.aggregation}_${mappings?.values?.column}` : mappings?.values?.column,
    }]

    return {
        series: slices,
        title,
    }
}



export const getSheetIdFromPath = (path: string, pageid: string) => {
    return path.split('#')[1] ?? JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.DATA_SHEET_ID) ?? '{}')[pageid]
}

export const getCurrentPageFilters = (filtersConfig: FilterConfigType[], selectedFilters: MapAny) => {
    const datasetFilters: MapAny = {}

    filtersConfig?.forEach((filter) => {
        if (selectedFilters[filter?.key]) {
            filter.targets.forEach((target) => {
                const conditionValues = getConditionValues({ ...selectedFilters[filter?.key], colId: target.column })

                datasetFilters[target.dataset_id] = datasetFilters[target.dataset_id] ? [...datasetFilters[target.dataset_id], conditionValues] : [conditionValues]
            })
        }
    })

    const appliedFilters = Object.keys(datasetFilters).map((datasetId) => {
        return {
            dataset_id: datasetId,
            filters: {
                logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
                conditions: datasetFilters[datasetId]
            }
        }
    })

    return appliedFilters
}