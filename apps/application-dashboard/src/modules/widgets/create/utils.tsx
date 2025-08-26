import { type IServerSideGetRowsRequest } from 'ag-grid-community';
import { compareAsc, isValid } from 'date-fns';
import {
  AGGREGATION_OPTIONS,
  DEFAULT_FILTER_OPERATORS,
  defaultGroupStats,
  NUMBER_COLUMN_TYPES,
} from 'modules/widgets/create/constants';
import {
  ChartSpecificFields,
  DatasetColumn,
  GetWidgetLayoutParams,
  GroupStats,
  SetupColumnsAndFiltersParams,
  WidgetCreationFormData,
} from 'modules/widgets/create/types';
import { WidgetSize } from 'modules/widgets/widget.types';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { getFilterModelFromGroupAndFilterModel } from '@/components/common/table/table.utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { filtersContextActions } from '@/components/filter/filters.context';
import { LayoutType } from '@/types/api/pagesApi.types';
import {
  AGGREGATION_TYPES,
  BarLineChartWidgetMapping,
  FIELD_TYPES,
  PieDonutChartWidgetMapping,
  WIDGET_TYPES,
  WidgetInstanceType,
} from '@/types/api/widgets.types';
import { MapAny } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';
import { checkIsObjectEmpty, snakeCaseToSentenceCase } from '@/utils/common';

export const getWidgetLayout: (params: GetWidgetLayoutParams) => LayoutType = (params) => {
  const { lastWidgetLayout, size, visualizationType } = params;
  const isFirstWidget = Object.values(lastWidgetLayout).every((value) => value === 0);

  if (visualizationType === WIDGET_TYPES.KPI) {
    return getKPILayout(lastWidgetLayout, isFirstWidget);
  } else {
    return getChartLayout(lastWidgetLayout, size, isFirstWidget);
  }
};

const getKPILayout = (lastWidgetLayout: LayoutType, isFirstWidget: boolean): LayoutType => {
  const layout: LayoutType = {
    x: 0,
    y: 0,
    w: 5.33,
    h: 1.45,
  };

  if (isFirstWidget) {
    return layout;
  }

  // Calculate x position based on last widget's position and width
  if (lastWidgetLayout.x === 0 && lastWidgetLayout.h !== 0) {
    if (lastWidgetLayout.w === 8) {
      layout.x = 10.66;
    } else if (lastWidgetLayout.w !== 16) {
      layout.x = 5.33;
    }
  } else if (lastWidgetLayout.x === 5.33) {
    layout.x = 10.66;
  }

  // Calculate y position
  if (lastWidgetLayout.x === 0 && lastWidgetLayout.w !== 16) {
    layout.y = lastWidgetLayout.y;
  } else if (lastWidgetLayout.x === 5.33) {
    layout.y = lastWidgetLayout.y;
  } else {
    layout.y = lastWidgetLayout.y + 1;
  }

  return layout;
};

const getChartLayout = (lastWidgetLayout: LayoutType, size: string, isFirstWidget: boolean): LayoutType => {
  const layout: LayoutType = {
    x: 0,
    y: 0,
    w: size === 'half' ? 8 : 16,
    h: 5.52,
  };

  if (isFirstWidget) {
    return layout;
  }

  if (size === 'full') {
    layout.y = lastWidgetLayout.y + 1;

    return layout;
  }

  // Half-size chart positioning
  if (lastWidgetLayout.x === 0 && lastWidgetLayout.h !== 0 && lastWidgetLayout.w !== 16) {
    layout.x = 15;
    layout.y = lastWidgetLayout.y;
  } else {
    layout.y = lastWidgetLayout.y + 1;
  }

  return layout;
};

export const getColumnType = (column_type: string): string => {
  return NUMBER_COLUMN_TYPES.has(column_type) ? 'number' : column_type;
};

export const getEditFormData = (data: WidgetInstanceType, size: WidgetSize = 'half') => {
  if (checkIsObjectEmpty(data)) return { editFormData: null, preSelectedFilters: null };

  const chartSpecificFields = getChartSpecificFields(data);

  const editFormData: WidgetCreationFormData = {
    title: data.title,
    visualizationType: data.widget_type,
    datasetId: data.data_mappings.mappings[0].dataset_id,
    size,
    chartSpecificFields,
  };

  const preSelectedFilters = data.data_mappings.mappings[0].default_filters as FilterModelType;

  return { editFormData, preSelectedFilters };
};

const getChartSpecificFields = (data: WidgetInstanceType): ChartSpecificFields => {
  const mapping = data.data_mappings.mappings[0];

  switch (data.widget_type) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART:
      return getBarLineChartFields(mapping as BarLineChartWidgetMapping, data.widget_type);
    case WIDGET_TYPES.DONUT_CHART:
      return getDonutChartFields(mapping as PieDonutChartWidgetMapping);
    default:
      return {};
  }
};

const getBarLineChartFields = (
  mapping: BarLineChartWidgetMapping,
  widgetType: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART,
): ChartSpecificFields => {
  const chartFields = {
    xAxis: {
      column: mapping.fields.x_axis[0].column,
      column_type: mapping.fields.x_axis[0].type,
      filter_type: mapping.fields.x_axis[0].drilldown_filter_type || FILTER_TYPES.SEARCH,
    },
    yAxis: {
      column: mapping.fields.y_axis[0].column,
      aggregation: mapping.fields.y_axis[0].aggregation || AGGREGATION_TYPES.SUM,
      column_type: mapping.fields.y_axis[0].type,
      filter_type: mapping.fields.y_axis[0].drilldown_filter_type || FILTER_TYPES.SEARCH,
    },
    ...(mapping.fields.group_by?.[0]?.column
      ? {
          groupBy: {
            column: mapping.fields.group_by[0].column,
            column_type: mapping.fields.group_by[0].type,
            filter_type: mapping.fields.group_by[0].drilldown_filter_type || FILTER_TYPES.SEARCH,
            stacking: (mapping as any).is_stacked || false,
          },
        }
      : {}),
  };

  return widgetType === WIDGET_TYPES.BAR_CHART ? { barChart: chartFields as any } : { lineChart: chartFields as any };
};

const getDonutChartFields = (mapping: PieDonutChartWidgetMapping): ChartSpecificFields => {
  const donutChartFields = {
    field: {
      column: mapping.fields.values?.[0]?.column || '',
      aggregation: mapping.fields.values?.[0]?.aggregation || AGGREGATION_TYPES.SUM,
      column_type: mapping.fields.values?.[0]?.type || '',
      filter_type: mapping.fields.values?.[0]?.drilldown_filter_type || FILTER_TYPES.SEARCH,
    },
    groupBy: {
      column: mapping.fields.slices?.[0]?.column || '',
      column_type: mapping.fields.slices?.[0]?.type || '',
      filter_type: mapping.fields.slices?.[0]?.drilldown_filter_type || FILTER_TYPES.SEARCH,
    },
    dataFormat: 'value' as const,
  };

  return { donutChart: donutChartFields as any };
};

export const setupColumnsAndFilters = ({
  datasetFilterConfigData,
  dispatch,
  setDatasetColumns,
}: SetupColumnsAndFiltersParams) => {
  if (!datasetFilterConfigData?.length) return;

  const visibleColumns = datasetFilterConfigData?.filter((item: any) => !item?.metadata?.is_hidden);

  const filtersConfig = [];

  const columns: DatasetColumn[] = [];

  for (const column of visibleColumns) {
    filtersConfig.push({
      key: column.column,
      label: column.alias ?? snakeCaseToSentenceCase(column?.column),
      values: column.options,
      type: column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG ? FILTER_TYPES.TAGS : column?.type,
    });
    columns.push({
      column_name: column.column,
      column_type: column.datatype,
      alias: column.alias || snakeCaseToSentenceCase(column.column),
      label: column.alias || snakeCaseToSentenceCase(column.column),
      value: column.column,
      filter_type: column.type,
    });
  }

  dispatch({
    type: filtersContextActions.SET_FILTERS_CONFIG,
    payload: {
      filtersConfig,
    },
  });

  setDatasetColumns(columns);
};

export const getNumberColumns = (datasetColumns: DatasetColumn[]) => {
  return datasetColumns.filter((column) =>
    ['number', 'integer', 'float', 'decimal'].includes(getColumnType(column.column_type)),
  );
};

export const getMultiSelectColumns = (datasetColumns: DatasetColumn[]) => {
  return datasetColumns.filter((column) => column.filter_type === FILTER_TYPES.MULTI_SELECT);
};

export const getNonDateRangeColumns = (datasetColumns: DatasetColumn[]) => {
  return datasetColumns.filter((column) => column.filter_type !== FILTER_TYPES.DATE_RANGE);
};

export const getAggregationOptions = (columnType: string) =>
  columnType !== 'number'
    ? AGGREGATION_OPTIONS.filter((option) => option.value === AGGREGATION_TYPES.COUNT)
    : AGGREGATION_OPTIONS;

export const generateMockWidgetDetails = (
  formData: WidgetCreationFormData,
  selectedFilters: MapAny,
): WidgetInstanceType | null => {
  if (!formData.datasetId || !formData.chartSpecificFields) return null;
  let mockWidgetDetailsGenerated = null;

  const baseWidget = {
    widget_instance_id: 'preview-widget',
    widget_id: 'preview',
    sheet_id: 'preview-sheet',
    title: formData.title || 'New Widget',
    dataset_id: formData.datasetId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  switch (formData.visualizationType) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART:
      {
        const chartFields =
          formData.visualizationType === WIDGET_TYPES.BAR_CHART
            ? formData.chartSpecificFields.barChart
            : formData.chartSpecificFields.lineChart;
        const groupByColumn = chartFields?.groupBy?.column;

        if (!chartFields?.xAxis?.column || !chartFields?.yAxis?.column) return mockWidgetDetailsGenerated;
        mockWidgetDetailsGenerated = {
          ...baseWidget,
          widget_type: formData.visualizationType as WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART,
          data_mappings: {
            version: '1',
            mappings: [
              {
                dataset_id: formData.datasetId,
                fields: {
                  x_axis: [
                    {
                      type: getColumnType(chartFields?.xAxis?.column_type || ''),
                      column: chartFields?.xAxis.column || '',
                      field_type: FIELD_TYPES.DIMENSION,
                      drilldown_filter_type: chartFields?.xAxis?.filter_type,
                      drilldown_filter_operator:
                        DEFAULT_FILTER_OPERATORS[chartFields?.xAxis?.filter_type || FILTER_TYPES.SEARCH],
                    },
                  ],
                  y_axis: [
                    {
                      type: getColumnType(chartFields?.yAxis?.column_type || ''),
                      column: chartFields?.yAxis.column || '',
                      field_type: FIELD_TYPES.MEASURE,
                      aggregation: chartFields?.yAxis?.aggregation || '',
                    },
                  ],
                  ...(groupByColumn
                    ? {
                        group_by: [
                          {
                            type: getColumnType(chartFields?.groupBy?.column_type || ''),
                            column: groupByColumn || '',
                            field_type: FIELD_TYPES.DIMENSION,
                            drilldown_filter_type: chartFields?.groupBy?.filter_type,
                            drilldown_filter_operator:
                              DEFAULT_FILTER_OPERATORS[chartFields?.groupBy?.filter_type || FILTER_TYPES.SEARCH],
                          },
                        ],
                      }
                    : {}),
                },
                is_stacked: chartFields?.groupBy?.stacking || false,
                ...(selectedFilters
                  ? {
                      default_filters: getFilterModelFromGroupAndFilterModel({
                        filterModel: selectedFilters,
                      } as IServerSideGetRowsRequest),
                    }
                  : {}),
              },
            ],
          },
        };
      }

      return mockWidgetDetailsGenerated as WidgetInstanceType;

    case WIDGET_TYPES.DONUT_CHART: {
      const donutFields = formData.chartSpecificFields.donutChart;

      if (!donutFields?.field?.column || !donutFields?.groupBy) return mockWidgetDetailsGenerated;

      mockWidgetDetailsGenerated = {
        ...baseWidget,
        widget_type: WIDGET_TYPES.DONUT_CHART,
        data_mappings: {
          version: '1',
          mappings: [
            {
              dataset_id: formData.datasetId,
              fields: {
                values: [
                  {
                    column: donutFields.field.column,
                    aggregation: donutFields.field.aggregation,
                    field_type: FIELD_TYPES.MEASURE,
                    alias: donutFields.field.column,
                    type: getColumnType(donutFields?.field?.column_type || ''),
                  },
                ],
                slices: [
                  {
                    column: donutFields.groupBy.column,
                    field_type: FIELD_TYPES.DIMENSION,
                    drilldown_filter_type: donutFields.groupBy.filter_type,
                    drilldown_filter_operator:
                      DEFAULT_FILTER_OPERATORS[donutFields.groupBy.filter_type || FILTER_TYPES.MULTI_SELECT],
                    type: getColumnType(donutFields?.groupBy?.column_type || ''),
                  },
                ],
              },
              ...(selectedFilters
                ? {
                    default_filters: getFilterModelFromGroupAndFilterModel({
                      filterModel: selectedFilters,
                    } as IServerSideGetRowsRequest),
                  }
                : {}),
            },
          ],
        },
      };

      return mockWidgetDetailsGenerated as WidgetInstanceType;
    }

    case WIDGET_TYPES.KPI: {
      const kpiFields = formData.chartSpecificFields.kpiTag;

      if (!kpiFields?.metricField?.column) return mockWidgetDetailsGenerated;

      mockWidgetDetailsGenerated = {
        ...baseWidget,
        widget_type: WIDGET_TYPES.KPI,
        data_mappings: {
          version: '1',
          mappings: [
            {
              dataset_id: formData.datasetId,
              fields: {
                primary_value: [
                  {
                    type: getColumnType(kpiFields.metricField.column_type),
                    column: kpiFields.metricField.column,
                    field_type: FIELD_TYPES.MEASURE,
                    aggregation: kpiFields.metricField.aggregation,
                    alias: kpiFields.metricField.column,
                  },
                ],
              },
              ...(selectedFilters
                ? {
                    default_filters: getFilterModelFromGroupAndFilterModel({
                      filterModel: selectedFilters,
                    } as IServerSideGetRowsRequest),
                  }
                : {}),
            },
          ],
        },
      };

      return mockWidgetDetailsGenerated as unknown as WidgetInstanceType;
    }
  }

  return mockWidgetDetailsGenerated;
};

export const calculateAggregatedValue = (group: GroupStats, aggregation: AGGREGATION_TYPES): number => {
  switch (aggregation) {
    case AGGREGATION_TYPES.SUM:
      return group.sum;
    case AGGREGATION_TYPES.COUNT:
      return group.count;
    case AGGREGATION_TYPES.MIN:
      return group.min;
    case AGGREGATION_TYPES.MAX:
      return group.max;
    case AGGREGATION_TYPES.AVG:
      return group.sum / group.count;
    default:
      return group.sum;
  }
};

export const updateGroupStats = (group: GroupStats, value: number): void => {
  group.values.push(value);
  group.count += 1;
  group.sum += value;
  group.min = Math.min(group.min, value);
  group.max = Math.max(group.max, value);
};

export const sortByXAxis = (data: MapAny[], xKey: string): void => {
  data.sort((a, b) => {
    const aValue = new Date(a[xKey]);
    const bValue = new Date(b[xKey]);

    return compareAsc(aValue, bValue);
  });
};

const getXValue = (row: MapAny, xKey: string) => {
  const xValue = row?.[xKey];
  let formattedXValue = xValue ? new Date(xValue) : xValue;
  const isValidDate = isValid(formattedXValue);

  if (isValidDate) {
    formattedXValue.setHours(0, 0, 0, 0);
    formattedXValue = formattedXValue.toString();
  }

  return formattedXValue;
};

export const processGroupedChartData = (
  mockData: MapAny[],
  xKey: string,
  yKey: string,
  groupBy: string,
  aggregation: AGGREGATION_TYPES,
) => {
  const groupDistinctValues = new Set<string>();
  const groupedData = mockData.reduce<Record<string, Record<string, GroupStats>>>((acc, row) => {
    const xValue = getXValue(row, xKey);
    const yValue = row?.[yKey] ?? 0;
    const groupByValue = row?.[groupBy];

    if (xValue && groupByValue) {
      groupDistinctValues.add(groupByValue);

      if (!acc[xValue]) {
        acc[xValue] = {};
      }
      if (!acc[xValue][groupByValue]) {
        acc[xValue][groupByValue] = { ...defaultGroupStats };
      }

      updateGroupStats(acc[xValue][groupByValue], yValue);
    }

    return acc;
  }, {});

  const aggregatedGroupedData = Object.entries(groupedData).map(([xValue, groups]) => {
    const resultObj: MapAny[] = [];

    Array.from(groupDistinctValues).forEach((groupValue) => {
      const formattedData: MapAny = {
        [xKey]: xValue,
        [yKey]: null,
        [groupBy]: groupValue,
      };

      if (groups[groupValue]) {
        formattedData[yKey] = calculateAggregatedValue(groups[groupValue], aggregation);
      }

      resultObj.push(formattedData);
    });

    return resultObj;
  });

  return aggregatedGroupedData.flat();
};

export const processNonGroupedChartData = (
  mockData: MapAny[],
  xKey: string,
  yKey: string,
  aggregation: AGGREGATION_TYPES,
) => {
  const aggregatedData = mockData.reduce<Record<string, GroupStats>>((acc, row) => {
    const xValue = getXValue(row, xKey);
    const yValue = row?.[yKey] ?? 0;

    if (xValue) {
      if (!acc[xValue]) {
        acc[xValue] = { ...defaultGroupStats };
      }
      updateGroupStats(acc[xValue], yValue);
    }

    return acc;
  }, {});

  return Object.entries(aggregatedData).map(([xValue, group]) => ({
    [xKey]: xValue,
    [yKey]: calculateAggregatedValue(group, aggregation),
  }));
};
