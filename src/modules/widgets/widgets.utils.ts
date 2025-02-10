import { AgCartesianSeriesTooltipRendererParams, AgChartOptions } from 'ag-charts-community';
import { COLORS } from 'constants/colors';
import {
  AG_CHART_TYPES,
  CHART_CATEGORY_AXES,
  CHART_NUMBER_AXES,
  CHART_SLICE_TYPES,
  getDonutChartSeriesConfig,
  MAX_DONUT_CHART_SLICE_COUNT,
  WidgetDataValueType,
} from 'modules/widgets/widgets.constant';
import {
  FieldsMappingType,
  PieDonutChartWidgetMapping,
  WIDGET_TYPES,
  WidgetDataType,
  WidgetInstanceType,
} from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { LogicalOperatorType } from 'types/components/table.type';
import { formatNumber, getCommaSeparatedNumber, getMaxValue } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { getConditionValues } from 'components/common/table/table.utils';
import { FilterConfigType } from 'components/filter/filter.types';

export function groupTransactionsByDate(
  data: MapAny[],
  fields: FieldsMappingType,
): { data: MapAny[]; groupValues: string[] } {
  if (!data?.length) return { data: [], groupValues: [] };

  const groupBy = fields?.group_by?.[0]?.column ?? '';
  const xAxis = fields?.x_axis?.[0]?.column ?? '';
  const yAxis = fields?.y_axis?.[0]?.column ?? '';

  const grouped: MapAny = {};
  const groupValues = new Set<string>();

  data?.forEach((dataItem: MapAny) => {
    if (!grouped[dataItem[xAxis]]) {
      grouped[dataItem[xAxis]] = {
        [dataItem[groupBy]]: dataItem[yAxis],
      };
    }

    const brand = dataItem[groupBy] ?? 'Unknown';
    const amount = parseFloat(dataItem[yAxis]) || 0;

    groupValues.add(brand);
    if (!grouped[dataItem[xAxis]][brand]) {
      grouped[dataItem[xAxis]][brand] = amount;
    } else {
      grouped[dataItem[xAxis]][brand] = (grouped[dataItem[xAxis]][brand] as number) + amount;
    }
  });

  return {
    data: Object.keys(grouped).map((key) => ({ [xAxis]: key, ...grouped[key] })),
    groupValues: [...groupValues],
  };
}

/**
 * Formats the data array based on the types specified in the columns array.
 * @param response - The response object containing columns and data.
 * @returns The formatted data array.
 */
export function getDataWithDataType(responses: WidgetDataType[]) {
  return responses.map((response) => {
    const { columns, data } = response;

    return data.map((row) => {
      const formattedRow: MapAny = {};

      for (const column of columns) {
        const { column_name, column_type } = column;

        if (column_name in row) {
          const value = row[column_name as keyof typeof row];

          switch (column_type) {
            case WidgetDataValueType.STRING:
              formattedRow[column_name] = String(value);
              break;
            case WidgetDataValueType.DATE:
              formattedRow[column_name] = new Date(value as string);
              break;
            case WidgetDataValueType.DECIMAL:
            case WidgetDataValueType.NUMBER:
            case WidgetDataValueType.BIGINT:
            case WidgetDataValueType.INT:
            case WidgetDataValueType.SMALLINT:
            case WidgetDataValueType.TINYINT:
              {
                formattedRow[column_name] = Math.abs(parseFloat(value as string) ?? 0);
              }
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

export const getTransformedData = (data: WidgetDataType[], widgetDetails: WidgetInstanceType) => {
  const widgetType = widgetDetails.widget_type;
  const stackedValues: MapAny[] = [];

  const dataWithDataType = getDataWithDataType(data);

  switch (widgetType) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART: {
      const axis = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.y_axis?.[0];
      const mappings = widgetDetails?.data_mappings?.mappings[0];
      const groupedData = groupTransactionsByDate(dataWithDataType?.[0] ?? [], mappings?.fields);
      const maxValue = getMaxValue(dataWithDataType?.[0] ?? [], [axis?.column]);

      const yAxisTitle = `${axis?.column} (${axis?.aggregation}), in ${formatNumber(maxValue ?? '', 0, true, true)}`;

      if (widgetDetails?.data_mappings?.mappings?.[0]?.fields?.group_by?.length) {
        groupedData?.groupValues.forEach((value) => {
          stackedValues.push({ column: value });
        });

        return {
          transformedData: groupedData?.data,
          stackedValues,
          yAxisTitle,
          maxValueLength: formatNumber(maxValue, 0, false).split('').length,
        };
      }

      return {
        transformedData: dataWithDataType?.[0],
        stackedValues,
        yAxisTitle,
        maxValueLength: formatNumber(maxValue, 0, false).split('').length,
      };
    }
    case WIDGET_TYPES.DONUT_CHART:
    case WIDGET_TYPES.PIE_CHART: {
      if (dataWithDataType?.[0]?.length > 5) {
        const { slicedData, remainingData } = getGroupedDonutChartData(
          dataWithDataType,
          widgetDetails?.data_mappings?.mappings,
        );

        return { transformedData: slicedData ?? [], donutOthersData: remainingData ?? [] };
      }

      return { transformedData: dataWithDataType?.[0], stackedValues };
    }
    default:
      return { transformedData: dataWithDataType?.[0], stackedValues };
  }
};

export const getChartOptions = (
  widgetDetails: WidgetInstanceType,
  onNodeClick: (clickedNode: MapAny, xAxis: string) => void,
  baseOptions: AgChartOptions,
  stackedValues?: MapAny[],
  dataLength?: number,
  donutOthersData?: MapAny[],
) => {
  const chartType = AG_CHART_TYPES[widgetDetails.widget_type as unknown as keyof typeof AG_CHART_TYPES];

  const navigatorConfig =
    baseOptions?.data && baseOptions?.data?.length > 5
      ? {
          zoom: {
            enabled: true,
            buttons: {
              enabled: false,
            },
            minVisibleItemsX: 12,
          },
          initialState: {
            zoom: {
              ratioX: dataLength && dataLength > 12 ? { start: 1 - 12 / dataLength, end: 1 } : {},
            },
          },
        }
      : {};

  const label = {
    enabled: false,
    fontSize: 11,
    fontWeight: 450,
    color: COLORS.GRAY_950,
    placement: 'outside-end',
    padding: 6,
    formatter: (params: any) => {
      if (Number(params.datum[params.yKey])) return formatNumber(Number(params.datum[params.yKey]), 1, true);
      else return '';
    },
  };

  switch (widgetDetails.widget_type) {
    case WIDGET_TYPES.BAR_CHART: {
      const mappings = widgetDetails?.data_mappings?.mappings;
      const xAxis = mappings?.[0]?.fields?.x_axis?.[0]?.column || '';
      const yAxis = stackedValues?.length ? stackedValues : (mappings?.[0]?.fields?.y_axis ?? []);

      return {
        ...navigatorConfig,
        ...baseOptions,
        axes: [CHART_NUMBER_AXES, { ...CHART_CATEGORY_AXES, paddingInner: 0.5, paddingOuter: 1 }],
        series: yAxis.map((axis) => ({
          type: chartType,
          xKey: xAxis,
          cornerRadius: 2,
          yKey: `${axis?.column}`,
          yName: axis?.column || '',
          stacked: true,
          listeners: {
            nodeClick: (event: any) => onNodeClick(event.datum, xAxis),
          },
          tooltip: {
            showArrow: false,
            renderer: ({ datum, yKey, yName }: AgCartesianSeriesTooltipRendererParams) => ({
              data: [
                {
                  label: yName,
                  value: getCommaSeparatedNumber(datum[yKey], 2),
                },
              ],
            }),
          },
          label,
        })),
      };
    }
    case WIDGET_TYPES.LINE_CHART: {
      const mappings = widgetDetails?.data_mappings?.mappings;
      const xAxis = mappings?.[0]?.fields?.x_axis?.[0]?.column || '';
      const yAxis = stackedValues?.length ? stackedValues : (mappings?.[0]?.fields?.y_axis ?? []);

      return {
        ...navigatorConfig,
        ...baseOptions,
        axes: [CHART_NUMBER_AXES, { ...CHART_CATEGORY_AXES }],
        series: yAxis.map((axis) => ({
          type: chartType,
          xKey: xAxis,
          yKey: `${axis?.column}`,
          yName: axis?.column || '',
          stacked: true,
          marker: {
            enabled: false,
          },
          listeners: {
            nodeClick: (event: any) => onNodeClick(event.datum, xAxis),
          },
          tooltip: {
            showArrow: false,
            renderer: ({ datum, yKey, yName }: AgCartesianSeriesTooltipRendererParams) => ({
              data: [
                {
                  label: yName,
                  value: getCommaSeparatedNumber(datum[yKey], 2),
                },
              ],
            }),
          },
          label,
        })),
      };
    }
    case WIDGET_TYPES.DONUT_CHART:
    case WIDGET_TYPES.PIE_CHART: {
      const mappings = widgetDetails?.data_mappings?.mappings;
      const sliceKey = mappings?.[0]?.fields?.values?.[0]?.column;
      const totalNumber = baseOptions?.data?.reduce((acc, curr) => acc + curr[sliceKey ?? ''], 0);
      const chartConfig = getDonutChartSeriesConfig(dataLength ?? 0);
      const sliceColumn = mappings?.[0]?.fields?.slices?.[0]?.column;

      return {
        ...baseOptions,
        width: 500,
        height: 350,
        series: [
          {
            ...chartConfig,
            type: chartType,
            legendItemKey: sliceColumn,
            angleKey: sliceKey,
            calloutLabelKey: sliceKey,
            tooltip: {
              showArrow: false,
              renderer: ({ datum }: AgCartesianSeriesTooltipRendererParams) => {
                const sliceValue = datum[sliceColumn ?? ''];

                if (sliceValue !== CHART_SLICE_TYPES.OTHERS)
                  return {
                    heading: sliceKey,
                    data: [
                      {
                        label: datum[sliceColumn ?? ''],
                        value: getCommaSeparatedNumber(datum[sliceKey ?? ''], 2),
                      },
                    ],
                  };

                return {
                  heading: `${mappings?.[0]?.fields?.values?.[0]?.column.slice(0, 10)} (${mappings?.[0]?.fields?.values?.[0]?.aggregation})`,
                  title: datum[sliceColumn ?? ''],
                  data: donutOthersData?.length
                    ? donutOthersData.map((item) => ({
                        label: item[sliceColumn ?? ''],
                        value: getCommaSeparatedNumber(item[sliceKey ?? ''], 2),
                      }))
                    : [],
                };
              },
            },
            listeners: {
              nodeClick: (event: any) => onNodeClick(event.datum, mappings?.[0]?.fields?.slices?.[0]?.column ?? ''),
            },
            calloutLabel: {
              formatter: (params: MapAny) => {
                return formatNumber(params.datum[sliceKey ?? ''], 2);
              },
              offset: 8,
              enabled: true,
              fontSize: 11,
              fontWeight: 400,
              fontFamily: 'Inter',
              color: COLORS.GRAY_950,
            },
            calloutLine: {
              length: 18,
              strokeWidth: 2,
              colors: [COLORS.GRAY_400],
            },
            innerLabels: [
              {
                text: formatNumber(totalNumber),
                fontWeight: '900',
                fontFamily: 'Inter',
                pixelSize: 30,
                fontSize: 20,
                color: COLORS.GRAY_950,
              },
              {
                text: `${mappings?.[0]?.fields?.values?.[0]?.column.slice(0, 10)} (${mappings?.[0]?.fields?.values?.[0]?.aggregation})`,
                fontWeight: '500',
                fontFamily: 'Inter',
                fontSize: 11,
                color: COLORS.GRAY_700,
              },
            ],
          },
        ],
      };
    }
    default:
      break;
  }
};

export const getSheetIdFromPath = (path: string, pageid: string) => {
  return path.split('#')[1] ?? JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.DATA_SHEET_ID) ?? '{}')[pageid];
};

export const getCurrentPageFilters = (filtersConfig: FilterConfigType[], selectedFilters: MapAny) => {
  const datasetFilters: MapAny = {};

  filtersConfig?.forEach((filter) => {
    if (selectedFilters[filter?.key]) {
      filter.targets.forEach((target) => {
        const conditionValues = getConditionValues({ ...selectedFilters[filter?.key], colId: target.column });

        datasetFilters[target.dataset_id] = datasetFilters[target.dataset_id]
          ? [...datasetFilters[target.dataset_id], conditionValues]
          : [conditionValues];
      });
    }
  });

  const appliedFilters = Object.keys(datasetFilters)
    .map((datasetId) => {
      return {
        dataset_id: datasetId,
        filters: {
          logical_operator: LogicalOperatorType.OperatorLogicalAnd,
          conditions: datasetFilters[datasetId].filter((filter: any) => filter !== null),
        },
      };
    })
    .filter((filter) => !!filter?.filters?.conditions.length && filter?.filters?.conditions[0] !== null);

  return appliedFilters;
};

export const getGroupedDonutChartData = (data: MapAny[], mappings: PieDonutChartWidgetMapping[]) => {
  const sliceKey = mappings?.[0]?.fields?.slices?.[0]?.column;
  const valueKey = mappings?.[0]?.fields?.values?.[0]?.column;
  const sortedData = data[0]?.sort((a: MapAny, b: MapAny) => b[valueKey as keyof MapAny] - a[valueKey as keyof MapAny]);
  const slicedData = sortedData?.slice(0, MAX_DONUT_CHART_SLICE_COUNT);
  const remainingData = sortedData?.slice(MAX_DONUT_CHART_SLICE_COUNT);
  const remainingTotal = remainingData?.reduce((acc: number, curr: MapAny) => acc + curr[valueKey as keyof MapAny], 0);

  slicedData.push({
    [sliceKey as string]: CHART_SLICE_TYPES.OTHERS,
    [valueKey as string]: Number(remainingTotal.toFixed(2)),
  });

  return { slicedData, remainingData };
};
