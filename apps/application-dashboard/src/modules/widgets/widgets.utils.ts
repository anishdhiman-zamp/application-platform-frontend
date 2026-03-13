import { COLORS } from '@zamp-platform/ui';
import { DATE_FORMATS, PERIODICITY_TYPES } from '@zamp-platform/utils';
import { AgCartesianSeriesTooltipRendererParams, AgChartOptions } from 'ag-charts-community';
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  max,
  min,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { CURRENCY_SYMBOLS } from 'modules/page/pages.constants';
import { type ColumnFilterConfig, ParentFilters } from 'modules/widgets/Pivot/pivot.types';
import { WidgetNodeClickParams } from 'modules/widgets/widget.types';
import {
  AG_CHART_TYPES,
  CHART_NUMBER_AXES,
  CHART_SLICE_TYPES,
  getCategoryAxis,
  getDonutChartSeriesConfig,
  MAX_DONUT_CHART_SLICE_COUNT,
  WidgetDataValueType,
} from 'modules/widgets/widgets.constant';
import {
  AGGREGATION_TYPES,
  BarLineChartWidgetMapping,
  FieldsMappingType,
  KPITagWidgetMapping,
  PieDonutChartWidgetMapping,
  PivotTableWidgetMapping,
  WIDGET_TYPES,
  WidgetDataType,
  WidgetInstanceType,
} from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { LogicalOperatorType } from 'types/components/table.type';
import { formatNumber, getCommaSeparatedNumber, getMaxValue, snakeCaseToSentenceCase } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { type CONDITION_OPERATOR_TYPE, FILTER_OPERATOR_TYPE_MAP } from '@/components/filter/filters.constants';
import { getConditionValues } from 'components/common/table/table.utils';
import { type FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';

export function groupTransactionsByDate(
  data: MapAny[],
  fields: FieldsMappingType,
): { data: MapAny[]; groupValues: string[] } {
  if (!data?.length) return { data: [], groupValues: [] };

  const groupBy = fields?.group_by?.[0]?.alias ?? fields?.group_by?.[0]?.column ?? '';
  const xAxis = fields?.x_axis?.[0]?.alias ?? fields?.x_axis?.[0]?.column ?? '';
  const yAxis = fields?.y_axis?.[0]?.alias ?? fields?.y_axis?.[0]?.column ?? '';

  const grouped: MapAny = {};
  const groupValues = new Set<string>();

  data?.forEach((dataItem: MapAny) => {
    if (!grouped[dataItem[xAxis]]) {
      grouped[dataItem[xAxis]] = {};
    }

    const key = dataItem[groupBy] ?? 'Unknown';
    const value = parseFloat(dataItem[yAxis]) || 0;

    groupValues.add(key);
    if (!grouped[dataItem[xAxis]][key]) {
      grouped[dataItem[xAxis]][key] = value;
    } else {
      grouped[dataItem[xAxis]][key] = (grouped[dataItem[xAxis]][key] as number) + value;
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
  return responses?.map((response) => {
    const { columns, data } = response;

    return data.map((row) => {
      const formattedRow: MapAny = {};

      for (const column of columns) {
        const { column_name, column_type } = column;

        if (column_name in row) {
          const value = row[column_name as keyof typeof row];

          switch (column_type) {
            case WidgetDataValueType.STRING:
            case WidgetDataValueType.VARCHAR:
              formattedRow[column_name] = String(value);
              break;
            case WidgetDataValueType.DATE:
            case WidgetDataValueType.TIMESTAMP:
              formattedRow[column_name] = new Date(value as string);
              break;
            case WidgetDataValueType.LONG:
            case WidgetDataValueType.DECIMAL:
            case WidgetDataValueType.NUMBER:
            case WidgetDataValueType.BIGINT:
            case WidgetDataValueType.INT:
            case WidgetDataValueType.SMALLINT:
            case WidgetDataValueType.TINYINT:
            case WidgetDataValueType.INT8:
              {
                formattedRow[column_name] = parseFloat(value as string) ?? 0;
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

export const getTransformedData = (data: WidgetDataType[], widgetDetails: WidgetInstanceType, currency?: string) => {
  const widgetType = widgetDetails.widget_type;
  const stackedValues: MapAny[] = [];

  const dataWithDataType = getDataWithDataType(data);

  switch (widgetType) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART: {
      const axis = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.y_axis?.[0];
      const axisKey = axis?.alias ?? axis?.column;
      const mappings = widgetDetails?.data_mappings?.mappings[0];
      const groupedData = groupTransactionsByDate(dataWithDataType?.[0] ?? [], mappings?.fields);
      const maxValue = getMaxValue(dataWithDataType?.[0] ?? [], [axisKey]);
      const aggregation = axis?.aggregation !== AGGREGATION_TYPES.COUNT;
      const yAxisTitle = `${axisKey} (${axis?.aggregation}), ${aggregation ? (currency ?? '') : ''} in ${formatNumber(maxValue ?? '', 0, true, true)}`;

      if (widgetDetails?.data_mappings?.mappings?.[0]?.fields?.group_by?.length) {
        groupedData?.groupValues.forEach((value) => {
          stackedValues.push({ column: value });
        });

        return {
          transformedData: groupedData?.data,
          stackedValues,
          yAxisTitle,
          maxValueLength: formatNumber(maxValue, 0, false).split('')?.length,
          showCurrency: aggregation,
        };
      }

      return {
        transformedData: dataWithDataType?.[0],
        stackedValues,
        yAxisTitle,
        maxValueLength: formatNumber(maxValue, 0, false).split('')?.length,
        showCurrency: aggregation,
      };
    }
    case WIDGET_TYPES.DONUT_CHART:
    case WIDGET_TYPES.PIE_CHART: {
      const aggregation =
        widgetDetails?.data_mappings?.mappings?.[0]?.fields?.values?.[0]?.aggregation !== AGGREGATION_TYPES.COUNT;

      if (dataWithDataType?.[0]?.length > 5) {
        const { slicedData, remainingData } = getGroupedDonutChartData(
          dataWithDataType,
          widgetDetails?.data_mappings?.mappings,
        );

        return { transformedData: slicedData ?? [], donutOthersData: remainingData ?? [], showCurrency: aggregation };
      }

      return { transformedData: dataWithDataType?.[0] ?? [], stackedValues, showCurrency: aggregation };
    }
    default:
      return { transformedData: dataWithDataType?.[0] ?? [], stackedValues, showCurrency: false };
  }
};

/**
 * Checks if a given data value type is a timestamp-related type.
 * @param type - The data value type to check
 * @returns true if the type is a timestamp type, false otherwise
 */
export const isTimestampType = (type: string): boolean => {
  return [
    WidgetDataValueType.TIMESTAMP,
    WidgetDataValueType.TIMESTAMP_NTZ,
    WidgetDataValueType.DATETIME,
    WidgetDataValueType.DATE,
    WidgetDataValueType.TIME,
  ].includes(type as WidgetDataValueType);
};

/**
 * Checks if the x-axis of a bar or line chart widget is a timestamp type.
 * @param widgetDetails - The widget instance details
 * @returns true if the x-axis is a timestamp type, false otherwise
 */
export const isXAxisTimestamp = (widgetDetails: WidgetInstanceType): boolean => {
  const isBarOrLineChart =
    widgetDetails.widget_type === WIDGET_TYPES.BAR_CHART || widgetDetails.widget_type === WIDGET_TYPES.LINE_CHART;
  const fields = isBarOrLineChart ? widgetDetails?.data_mappings?.mappings?.[0]?.fields : undefined;

  const xAxisType =
    isBarOrLineChart && fields && 'x_axis' in fields && (fields as FieldsMappingType)?.x_axis?.[0]?.type?.toUpperCase();

  return isTimestampType(`${xAxisType}`);
};

export const getChartOptions = (
  widgetDetails: WidgetInstanceType,
  onNodeClick: (params: WidgetNodeClickParams) => void,
  baseOptions: AgChartOptions,
  currency = '',
  stackedValues?: MapAny[],
  dataLength?: number,
  donutOthersData?: MapAny[],
  periodicity: PERIODICITY_TYPES = PERIODICITY_TYPES.DAILY,
  stacked?: boolean,
) => {
  const chartType = AG_CHART_TYPES[widgetDetails.widget_type as unknown as keyof typeof AG_CHART_TYPES];
  const isXaxisTimestamp = isXAxisTimestamp(widgetDetails);

  const categoryAxis = getCategoryAxis(periodicity, isXaxisTimestamp);
  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  const currencyDecimalPlaces = 2;

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
              ratioX: dataLength && dataLength > 5 ? { start: 1 - 5 / dataLength, end: 1 } : {},
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
      const xAxis = mappings?.[0]?.fields?.x_axis?.[0]?.alias ?? (mappings?.[0]?.fields?.x_axis?.[0]?.column || '');
      const datasetId = mappings?.[0]?.dataset_id;
      const drilldown_config = mappings?.[0]?.drilldown_config;
      const default_filters = mappings?.[0]?.default_filters;
      const fields = mappings?.[0]?.fields;
      const isStacked = mappings?.[0]?.is_stacked;

      const baseMapping = {
        type: chartType,
        xKey: xAxis,
        cornerRadius: 2,
        stacked: isStacked,
        listeners: {
          nodeClick: (event: any) =>
            onNodeClick({
              clickedNode: event.datum,
              xAxis,
              datasetId,
              datasetDefaultFilters: JSON.stringify(default_filters),
              drilldown_config,
              fields,
              yAxis: event?.yKey,
            }),
        },
        tooltip: {
          showArrow: false,
          renderer: ({ datum, yKey, yName }: AgCartesianSeriesTooltipRendererParams) => ({
            data: [
              {
                label: snakeCaseToSentenceCase(yName ?? ''),
                value: `${currencySymbol} ${getCommaSeparatedNumber(datum[yKey], currencyDecimalPlaces)}`,
              },
            ],
          }),
        },
        label,
      };

      const series = stackedValues?.length
        ? stackedValues?.map((value) => ({
            ...baseMapping,
            yKey: value?.column,
            yName: value?.column,
          }))
        : mappings.map((mapping) => ({
            ...baseMapping,
            yKey: mapping?.fields?.y_axis?.[0]?.alias ?? mapping?.fields?.y_axis?.[0]?.column,
            yName: mapping?.fields?.y_axis?.[0]?.alias ?? mapping?.fields?.y_axis?.[0]?.column,
            listeners: {
              nodeClick: (event: any) =>
                onNodeClick({
                  clickedNode: event.datum,
                  xAxis,
                  datasetId: mapping?.dataset_id,
                  datasetDefaultFilters: JSON.stringify(mapping?.default_filters),
                  drilldown_config: mapping?.drilldown_config,
                  fields: mapping?.fields,
                  yAxis: event?.yKey,
                }),
            },
          }));

      return {
        ...navigatorConfig,
        ...baseOptions,
        axes: [
          CHART_NUMBER_AXES,
          { ...categoryAxis, paddingInner: 0.5, paddingOuter: dataLength && dataLength > 1 ? 1 : 0.4 },
        ],
        series,
      };
    }
    case WIDGET_TYPES.LINE_CHART: {
      const mappings = widgetDetails?.data_mappings?.mappings;
      const xAxis = mappings?.[0]?.fields?.x_axis?.[0]?.alias ?? mappings?.[0]?.fields?.x_axis?.[0]?.column;
      const datasetId = mappings?.[0]?.dataset_id;
      const drilldown_config = mappings?.[0]?.drilldown_config;
      const default_filters = mappings?.[0]?.default_filters;
      const fields = mappings?.[0]?.fields;

      const baseMapping = {
        type: chartType,
        xKey: xAxis,
        stacked,
        nodeClickRange: 'nearest',
        marker: {
          enabled: false,
        },
        listeners: {
          nodeClick: (event: any) =>
            onNodeClick({
              clickedNode: event.datum,
              xAxis,
              datasetId,
              datasetDefaultFilters: JSON.stringify(default_filters),
              drilldown_config,
              fields,
              yAxis: event?.yKey,
            }),
        },
        tooltip: {
          showArrow: false,
          renderer: ({ datum, yKey, yName }: AgCartesianSeriesTooltipRendererParams) => ({
            data: [
              {
                label: snakeCaseToSentenceCase(yName ?? ''),
                value: `${currencySymbol ?? ''} ${getCommaSeparatedNumber(datum[yKey], currencyDecimalPlaces)}`,
              },
            ],
          }),
        },
        label,
      };

      const series = stackedValues?.length
        ? stackedValues?.map((value) => ({
            ...baseMapping,
            yKey: value?.column,
            yName: value?.column,
          }))
        : mappings.map((mapping) => ({
            ...baseMapping,
            yKey: mapping?.fields?.y_axis[0]?.alias ?? mapping?.fields?.y_axis[0]?.column,
            yName: mapping?.fields?.y_axis[0]?.alias ?? mapping?.fields?.y_axis[0]?.column,
            listeners: {
              nodeClick: (event: any) =>
                onNodeClick({
                  clickedNode: event.datum,
                  xAxis,
                  datasetId: mapping?.dataset_id,
                  datasetDefaultFilters: JSON.stringify(mapping?.default_filters),
                  drilldown_config: mapping?.drilldown_config,
                  fields: mapping?.fields,
                  yAxis: event?.yKey,
                }),
            },
          }));

      return {
        ...navigatorConfig,
        ...baseOptions,
        axes: [CHART_NUMBER_AXES, { ...categoryAxis }],
        series,
      };
    }
    case WIDGET_TYPES.DONUT_CHART:
    case WIDGET_TYPES.PIE_CHART: {
      const mappings = widgetDetails?.data_mappings?.mappings;
      const sliceKey = mappings?.[0]?.fields?.values?.[0]?.alias ?? mappings?.[0]?.fields?.values?.[0]?.column;
      const totalNumber = baseOptions?.data?.reduce((acc, curr) => acc + curr[sliceKey ?? ''], 0);
      const chartConfig = getDonutChartSeriesConfig(dataLength ?? 0);
      const sliceColumn = mappings?.[0]?.fields?.slices?.[0]?.alias ?? mappings?.[0]?.fields?.slices?.[0]?.column;

      return {
        ...baseOptions,
        width: 500,
        height: 335,
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
                    heading: snakeCaseToSentenceCase(sliceKey ?? ''),
                    data: [
                      {
                        label: snakeCaseToSentenceCase(datum[sliceColumn ?? '']),
                        value: `${currencySymbol} ${getCommaSeparatedNumber(datum[sliceKey ?? ''], currencyDecimalPlaces)}`,
                      },
                    ],
                  };

                return {
                  heading: `${mappings?.[0]?.fields?.values?.[0]?.column.slice(0, 10)} (${mappings?.[0]?.fields?.values?.[0]?.aggregation})`,
                  title: snakeCaseToSentenceCase(datum[sliceColumn ?? '']),
                  data: donutOthersData?.length
                    ? donutOthersData.map((item) => ({
                        label: item[sliceColumn ?? ''],
                        value: `${currencySymbol} ${getCommaSeparatedNumber(item[sliceKey ?? ''], currencyDecimalPlaces)}`,
                      }))
                    : [],
                };
              },
            },
            listeners: {
              nodeClick: (event: any) =>
                onNodeClick({
                  clickedNode: event.datum,
                  xAxis: mappings?.[0]?.fields?.slices?.[0]?.column ?? '',
                  datasetId: mappings?.[0]?.dataset_id ?? '',
                  datasetDefaultFilters: JSON.stringify(mappings?.[0]?.default_filters),
                  drilldown_config: mappings?.[0]?.drilldown_config,
                  fields: mappings?.[0]?.fields,
                }),
            },
            calloutLabel: {
              formatter: (params: MapAny) => {
                return `${currencySymbol} ${formatNumber(params.datum[sliceKey ?? ''], currencyDecimalPlaces)}`;
              },
              avoidCollisions: false,
              enabled: false,
              offset: 8,
              fontSize: 11,
              fontWeight: 400,
              fontFamily: 'Inter',
              color: COLORS.GRAY_950,
            },
            calloutLine: {
              length: 20,
              strokeWidth: 1,
              colors: [COLORS.GRAY_400],
            },
            innerLabels: [
              {
                text: `${currencySymbol} ${formatNumber(totalNumber)}`,
                fontWeight: '900',
                fontFamily: 'Inter',
                pixelSize: 30,
                fontSize: 20,
                color: COLORS.GRAY_950,
              },
              {
                text: `${snakeCaseToSentenceCase(mappings?.[0]?.fields?.values?.[0]?.column ?? '')} (${mappings?.[0]?.fields?.values?.[0]?.aggregation})`,
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
      filter?.targets?.forEach((target) => {
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
    .filter((filter) => !!filter?.filters?.conditions?.length && filter?.filters?.conditions[0] !== null);

  return appliedFilters;
};

export const getGroupedDonutChartData = (data: MapAny[], mappings: PieDonutChartWidgetMapping[]) => {
  const sliceKey = mappings?.[0]?.fields?.slices?.[0]?.alias ?? mappings?.[0]?.fields?.slices?.[0]?.column;
  const valueKey = mappings?.[0]?.fields?.values?.[0]?.alias ?? mappings?.[0]?.fields?.values?.[0]?.column;
  const sortedData = data[0]?.sort((a: MapAny, b: MapAny) => b[valueKey as keyof MapAny] - a[valueKey as keyof MapAny]);
  const slicedData = sortedData?.slice(0, MAX_DONUT_CHART_SLICE_COUNT);
  const remainingData = sortedData?.slice(MAX_DONUT_CHART_SLICE_COUNT);
  const remainingTotal = remainingData?.reduce((acc: number, curr: MapAny) => acc + curr[valueKey as keyof MapAny], 0);

  slicedData.push({
    [sliceKey as string]: CHART_SLICE_TYPES.OTHERS,
    [valueKey as string]: Number.isFinite(remainingTotal) ? Number(remainingTotal.toFixed(2)) : 0,
  });

  return { slicedData, remainingData };
};

export const getDateRangeWithPeriodicity = (
  periodicity: PERIODICITY_TYPES,
  date: string,
  startDate: string,
  endDate: string,
): [string, string] => {
  const currentDate = new Date(date);
  let minDate = startDate ? new Date(startDate) : new Date(315532800); // 1st Jan 1980
  let maxDate = endDate ? new Date(endDate) : new Date(7262226444222); // 1st Jan 2200

  switch (periodicity) {
    case PERIODICITY_TYPES.DAILY: {
      minDate = max([currentDate, minDate]);
      maxDate = min([currentDate, maxDate]);

      return [format(minDate, DATE_FORMATS.d_MMM_yyyy), format(maxDate, DATE_FORMATS.d_MMM_yyyy)];
    }

    case PERIODICITY_TYPES.WEEKLY: {
      minDate = max([startOfWeek(currentDate, { weekStartsOn: 1 }), minDate]);
      maxDate = min([endOfWeek(currentDate, { weekStartsOn: 1 }), maxDate]);

      return [format(minDate, DATE_FORMATS.d_MMM_yyyy), format(maxDate, DATE_FORMATS.d_MMM_yyyy)];
    }

    case PERIODICITY_TYPES.MONTHLY: {
      minDate = max([startOfMonth(currentDate), minDate]);
      maxDate = min([endOfMonth(currentDate), maxDate]);

      return [format(minDate, DATE_FORMATS.d_MMM_yyyy), format(maxDate, DATE_FORMATS.d_MMM_yyyy)];
    }

    case PERIODICITY_TYPES.QUARTERLY: {
      minDate = max([startOfQuarter(currentDate), minDate]);
      maxDate = min([endOfQuarter(currentDate), maxDate]);

      return [format(minDate, DATE_FORMATS.d_MMM_yyyy), format(maxDate, DATE_FORMATS.d_MMM_yyyy)];
    }

    case PERIODICITY_TYPES.YEARLY: {
      minDate = max([startOfYear(currentDate), minDate]);
      maxDate = min([endOfYear(currentDate), maxDate]);

      return [format(minDate, DATE_FORMATS.d_MMM_yyyy), format(maxDate, DATE_FORMATS.d_MMM_yyyy)];
    }

    default:
      return [format(currentDate, DATE_FORMATS.d_MMM_yyyy), format(currentDate, DATE_FORMATS.d_MMM_yyyy)];
  }
};

export const getDefaultFilterByDatasetId = ({
  mappings,
  datasetId,
  defaultWidgetFilters,
}: {
  mappings:
    | PivotTableWidgetMapping[]
    | BarLineChartWidgetMapping[]
    | PieDonutChartWidgetMapping[]
    | KPITagWidgetMapping[];
  datasetId?: string;
  defaultWidgetFilters?: string;
}) => {
  const defaultFilters: ParentFilters = {};

  if (defaultWidgetFilters) {
    JSON.parse(defaultWidgetFilters ?? '{}')?.conditions?.forEach((condition: any) => {
      defaultFilters[condition?.column] = {
        filterType: FILTER_OPERATOR_TYPE_MAP[condition?.operator as keyof typeof FILTER_OPERATOR_TYPE_MAP],
        type: condition?.operator,
        values: Array.isArray(condition?.value) ? [...condition.value] : [condition?.value],
      };
    });
  } else {
    mappings?.forEach((mapping) => {
      if (mapping?.dataset_id === datasetId && mapping?.default_filters) {
        mapping?.default_filters?.conditions?.forEach((condition) => {
          defaultFilters[condition?.column] = {
            filterType: FILTER_OPERATOR_TYPE_MAP[condition?.operator as keyof typeof FILTER_OPERATOR_TYPE_MAP],
            type: condition?.operator,
            values: Array.isArray(condition?.value) ? [...condition.value] : [condition?.value],
          };
        });
      }
    });
  }

  return defaultFilters;
};

export const getDefaultFilters = ({
  mappings,
  defaultWidgetFilters,
  currentRefColumnFilters,
  datasetFilters,
}: {
  mappings?:
    | PivotTableWidgetMapping[]
    | BarLineChartWidgetMapping[]
    | PieDonutChartWidgetMapping[]
    | KPITagWidgetMapping[];

  defaultWidgetFilters?: string;
  currentRefColumnFilters?: ColumnFilterConfig[];
  datasetFilters?: {
    [column: string]: {
      target_column: string;
      filter_type: FILTER_TYPES;
      filter_operator: CONDITION_OPERATOR_TYPE;
    };
  };
}) => {
  const defaultFilters: ParentFilters = {};

  if (defaultWidgetFilters) {
    JSON.parse(defaultWidgetFilters ?? '{}')?.conditions?.forEach((condition: any) => {
      const datasetFilterKeys = Object.keys(datasetFilters ?? {});

      if (datasetFilterKeys?.includes(condition?.column)) {
        defaultFilters[condition?.column] = {
          filterType: datasetFilters?.[condition?.column]?.filter_type,
          type: condition?.operator,
          values: Array.isArray(condition?.value) ? [...condition.value] : [condition?.value],
        };
      }
    });
  } else {
    mappings?.forEach((mapping) => {
      mapping?.default_filters?.conditions?.forEach((condition) => {
        if (currentRefColumnFilters?.find((filter) => filter?.column === condition?.column)) {
          const key =
            currentRefColumnFilters?.find((filter) => filter?.column === condition?.column)?.target ??
            condition?.column;

          defaultFilters[key] = {
            filterType: currentRefColumnFilters?.find((filter) => filter?.column === condition?.column)?.filterType,
            type: condition?.operator,
            values: Array.isArray(condition?.value) ? [...condition.value] : [condition?.value],
          };
        }
      });
    });
  }

  return defaultFilters;
};

export const mergeFilters = (currentFilters: ParentFilters, defaultFilters: ParentFilters) => {
  const mergedFilters: ParentFilters = {};

  Object.keys({ ...currentFilters, ...defaultFilters }).forEach((key) => {
    const currentValues = currentFilters[key]?.values || [];
    const defaultValues = defaultFilters[key]?.values || [];

    if (currentFilters[key] && defaultFilters[key]) {
      mergedFilters[key] = {
        ...currentFilters[key],
        values: currentValues.filter((value: string) => defaultValues.includes(value)),
      };
    } else {
      mergedFilters[key] = currentFilters[key] || defaultFilters[key];
    }
  });

  return mergedFilters;
};

export const transformFilterKeys = (
  datasetClickFilter: ParentFilters,
  currentDatasetFilters: MapAny,
): ParentFilters => {
  const transformedClickFilter: ParentFilters = {};

  Object.entries(datasetClickFilter).forEach(([key, value]) => {
    if (currentDatasetFilters[key] && currentDatasetFilters[key]?.target_column) {
      transformedClickFilter[currentDatasetFilters[key]?.target_column] = value;
    }
  });

  return transformedClickFilter;
};

export const getTimeColumns = (widgetDetails: WidgetInstanceType) => {
  const widgetType = widgetDetails?.widget_type;

  if (widgetType !== WIDGET_TYPES.LINE_CHART && widgetType !== WIDGET_TYPES.BAR_CHART) {
    return '';
  }

  const { data_mappings } = widgetDetails;
  const { mappings } = data_mappings;
  const timeColumns = mappings?.map((mapping) =>
    mapping?.fields?.x_axis
      ?.filter((axis) => isTimestampType(axis?.type?.toUpperCase() ?? ''))
      ?.map((axis) => ({ dataset_id: mapping?.dataset_id, column: axis?.column })),
  );

  return JSON.stringify(timeColumns.flat());
};
