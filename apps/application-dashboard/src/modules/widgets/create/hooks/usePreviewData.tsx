import { useCallback, useEffect, useMemo } from 'react';
import { defaultGroupStats } from 'modules/widgets/create/constants';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { ChartField, ChartFields, GroupStats, SetupChartParams } from 'modules/widgets/create/types';
import {
  calculateAggregatedValue,
  generateMockWidgetDetails,
  processGroupedChartData,
  processNonGroupedChartData,
  sortByXAxis,
  updateGroupStats,
} from 'modules/widgets/create/utils';
import { useFiltersContextStore } from '@/components/filter/filters.context';
import { AGGREGATION_TYPES, WIDGET_TYPES, WidgetDataType } from '@/types/api/widgets.types';
import { MapAny } from '@/types/commonTypes';

const createColumnDefinition = (field: ChartField | undefined, fallbackName = '') => ({
  column_name: field?.column ?? fallbackName,
  column_type: field?.column_type?.toUpperCase() ?? '',
});

const createYAxisColumnDefinition = (field: ChartField | undefined, fallbackName = '') => ({
  column_name: field?.column ?? fallbackName,
  column_type: 'number',
});

const createBasePreviewData = (
  data: MapAny[],
  columns: Array<{ column_name: string; column_type: string }>,
): WidgetDataType => ({
  columns,
  data,
  rowcount: data.length,
  status: '',
  error: {},
});

const processChartData = (
  mockData: MapAny[],
  xKey: string,
  yKey: string,
  groupByColumn: string,
  aggregation: AGGREGATION_TYPES,
): MapAny[] => {
  if (!mockData?.length) return [];

  const formattedData = groupByColumn
    ? processGroupedChartData(mockData, xKey, yKey, groupByColumn, aggregation)
    : processNonGroupedChartData(mockData, xKey, yKey, aggregation);

  sortByXAxis(formattedData, xKey);

  return formattedData;
};

const setupBarChart = ({
  formData,
  mockData,
  setPreviewData,
  setMockWidgetDetails,
  mockWidgetDetailsLocal,
}: SetupChartParams) => {
  const chartFields = formData.chartSpecificFields.barChart as ChartFields;

  if (!chartFields?.yAxis?.aggregation) return;

  const { xAxis, yAxis, groupBy } = chartFields;
  const xKey = xAxis?.column ?? '';
  const yKey = yAxis?.column ?? '';
  const groupByColumn = groupBy?.column ?? '';

  const formattedData = processChartData(mockData, xKey, yKey, groupByColumn, yAxis.aggregation!);

  const columns = [
    createColumnDefinition(xAxis),
    createYAxisColumnDefinition(yAxis),
    ...(groupByColumn ? [createColumnDefinition(groupBy)] : []),
  ];

  const previewData = [createBasePreviewData(formattedData, columns)];

  setPreviewData(previewData);
  setMockWidgetDetails(mockWidgetDetailsLocal);
};

const setupLineChart = ({
  formData,
  mockData,
  setPreviewData,
  setMockWidgetDetails,
  mockWidgetDetailsLocal,
}: SetupChartParams) => {
  const chartFields = formData.chartSpecificFields.lineChart as ChartFields;

  if (!chartFields?.yAxis?.aggregation) return;

  const { xAxis, yAxis, groupBy } = chartFields;
  const xKey = xAxis?.column ?? '';
  const yKey = yAxis?.column ?? '';
  const groupByColumn = groupBy?.column ?? '';

  const formattedData = processChartData(mockData, xKey, yKey, groupByColumn, yAxis.aggregation!);

  const columns = [
    createColumnDefinition(xAxis),
    createYAxisColumnDefinition(yAxis),
    ...(groupByColumn ? [createColumnDefinition(groupBy)] : []),
  ];

  const previewData = [createBasePreviewData(formattedData, columns)];

  setPreviewData(previewData);
  setMockWidgetDetails(mockWidgetDetailsLocal);
};

const setupDonutChart = ({
  formData,
  mockData,
  setPreviewData,
  setMockWidgetDetails,
  mockWidgetDetailsLocal,
}: SetupChartParams) => {
  const donutFields = formData.chartSpecificFields.donutChart;

  if (!donutFields?.field?.column || !donutFields?.groupBy?.column || !donutFields?.field?.aggregation) return;

  const { field, groupBy } = donutFields;
  const donutValueKey = field.column!;
  const donutGroupBy = groupBy.column!;

  // Early return if no data
  if (!mockData?.length) {
    setPreviewData([createBasePreviewData([], [])]);
    setMockWidgetDetails(mockWidgetDetailsLocal);

    return;
  }

  const groupedData = mockData.reduce<Record<string, GroupStats>>((acc, row) => {
    const groupByValue = row[donutGroupBy];
    const value = row[donutValueKey] ?? 0;

    if (groupByValue != null) {
      if (!acc[groupByValue]) {
        acc[groupByValue] = { ...defaultGroupStats };
      }
      updateGroupStats(acc[groupByValue], value);
    }

    return acc;
  }, {});

  const aggregatedData = Object.entries(groupedData)
    .map(([groupValue, group]) => ({
      [donutGroupBy]: groupValue,
      [donutValueKey]: calculateAggregatedValue(group, field.aggregation!),
    }))
    .sort((a, b) => {
      const aValue = a[donutValueKey] as number;
      const bValue = b[donutValueKey] as number;

      return bValue - aValue;
    });

  const columns = [createYAxisColumnDefinition(field), createColumnDefinition(groupBy)];

  const previewData = [createBasePreviewData(aggregatedData, columns)];

  setPreviewData(previewData);
  setMockWidgetDetails(mockWidgetDetailsLocal);
};

const setupKPI = ({
  formData,
  mockData,
  setPreviewData,
  setMockWidgetDetails,
  mockWidgetDetailsLocal,
}: SetupChartParams) => {
  const kpiFields = formData.chartSpecificFields.kpiTag;
  const metricField = kpiFields?.metricField;

  if (!metricField?.column || !metricField?.aggregation || !mockData?.length) {
    setPreviewData([{ data: [{ value: 0 }], columns: [], rowcount: 0, status: '', error: {} }]);
    setMockWidgetDetails(mockWidgetDetailsLocal);

    return;
  }

  let kpiPreviewData = 0;
  const { column, aggregation } = metricField;

  // Optimize aggregation calculations with early returns
  switch (aggregation) {
    case AGGREGATION_TYPES.SUM:
      kpiPreviewData = mockData.reduce((acc, row) => acc + (row[column] ?? 0), 0);
      break;
    case AGGREGATION_TYPES.COUNT:
      kpiPreviewData = mockData.length;
      break;
    case AGGREGATION_TYPES.AVG: {
      const sum = mockData.reduce((acc, row) => acc + (row[column] ?? 0), 0);

      kpiPreviewData = sum / mockData.length;
      break;
    }
    case AGGREGATION_TYPES.MIN:
      kpiPreviewData = Math.min(...mockData.map((row) => row[column] ?? Infinity));
      break;
    case AGGREGATION_TYPES.MAX:
      kpiPreviewData = Math.max(...mockData.map((row) => row[column] ?? -Infinity));
      break;
    default:
      kpiPreviewData = 0;
  }

  setPreviewData([{ data: [{ value: kpiPreviewData }], columns: [], rowcount: 0, status: '', error: {} }]);
  setMockWidgetDetails(mockWidgetDetailsLocal);
};

const CHART_SETUP_MAP = {
  [WIDGET_TYPES.BAR_CHART]: setupBarChart,
  [WIDGET_TYPES.LINE_CHART]: setupLineChart,
  [WIDGET_TYPES.DONUT_CHART]: setupDonutChart,
  [WIDGET_TYPES.KPI]: setupKPI,
} as const;

const usePreviewData = () => {
  const { formData, setPreviewData, setMockWidgetDetails, mockData } = useWidgetCreationContext();
  const {
    state: { selectedFilters },
  } = useFiltersContextStore();

  // Memoize mock widget details with stable dependencies
  const mockWidgetDetailsLocal = useMemo(
    () => generateMockWidgetDetails(formData, selectedFilters),
    [formData, selectedFilters],
  );

  // Memoize the fetch function with optimized dependencies
  const fetchPreviewData = useCallback(() => {
    if (!formData.datasetId || !mockWidgetDetailsLocal) return;

    const setupFunction = CHART_SETUP_MAP[formData.visualizationType as keyof typeof CHART_SETUP_MAP];

    if (!setupFunction) return;

    setupFunction({
      formData,
      mockData,
      setPreviewData,
      setMockWidgetDetails,
      mockWidgetDetailsLocal,
    });
  }, [
    formData.datasetId,
    formData.visualizationType,
    mockData,
    mockWidgetDetailsLocal,
    setPreviewData,
    setMockWidgetDetails,
  ]);

  // Only run effect when necessary dependencies change
  useEffect(() => {
    fetchPreviewData();
  }, [fetchPreviewData]);
};

export default usePreviewData;
