import {
  AGGREGATION_TYPES,
  type FieldsMappingType,
  type PieDonutChartWidgetMapping,
  WIDGET_TYPES,
} from 'types/api/widgets.types';
import { formatNumber, getMaxValue } from 'utils/common';
import {
  CHART_SLICE_TYPES,
  MAX_DONUT_CHART_SLICE_COUNT,
  WidgetDataValueType,
} from '@/modules/widgets/widgets.constant';
import type { MapAny } from '@/types/commonTypes';

interface WidgetDataType {
  [key: string]: any;
}

interface WidgetInstanceType {
  widget_type: string;
  data_mappings?: {
    mappings?: Array<{
      fields?: {
        y_axis?: Array<{
          alias?: string;
          column?: string;
          aggregation?: string;
        }>;
        group_by?: any[];
        values?: Array<{
          aggregation?: string;
        }>;
      };
    }>;
  };
}

export function groupTransactionsByDate(
  data: MapAny[],
  fields: FieldsMappingType,
): { data: MapAny[]; groupValues: string[] } {
  if (!data?.length) return { data: [], groupValues: [] };

  const mappingVariable = fields?.group_by?.[0]?.alias ?? fields?.group_by?.[0]?.column;
  const groupBy = mappingVariable ?? '';
  const xAxis = mappingVariable ?? '';
  const yAxis = mappingVariable ?? '';

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
  return responses.map((response) => {
    const { columns, data } = response;

    return data.map((row: any) => {
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

export const getGroupedDonutChartData = (data: MapAny[], mappings: PieDonutChartWidgetMapping[]) => {
  const sliceKey = mappings?.[0]?.fields?.slices?.[0]?.alias ?? mappings?.[0]?.fields?.slices?.[0]?.column;
  const valueKey = mappings?.[0]?.fields?.values?.[0]?.alias ?? mappings?.[0]?.fields?.values?.[0]?.column;
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

export const getTransformedDataServerSafe = (
  data: WidgetDataType[],
  widgetDetails: WidgetInstanceType,
  currency?: string,
) => {
  const widgetType = widgetDetails.widget_type;
  const stackedValues: any[] = [];

  const dataWithDataType = getDataWithDataType(data);

  switch (widgetType) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART: {
      const axis = widgetDetails?.data_mappings?.mappings?.[0]?.fields?.y_axis?.[0];
      const axisKey = axis?.alias ?? axis?.column;
      const mappings = widgetDetails?.data_mappings?.mappings?.[0];
      const groupedData = groupTransactionsByDate(dataWithDataType?.[0] ?? [], mappings?.fields as FieldsMappingType);
      const maxValue = getMaxValue(dataWithDataType?.[0] ?? [], [axisKey ?? '']);
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
          widgetDetails?.data_mappings?.mappings as PieDonutChartWidgetMapping[],
        );

        return {
          transformedData: slicedData ?? [],
          donutOthersData: remainingData ?? [],
          showCurrency: aggregation,
          stackedValues,
          yAxisTitle: '',
          maxValueLength: 0,
        };
      }

      return {
        transformedData: dataWithDataType?.[0] ?? [],
        stackedValues,
        showCurrency: aggregation,
        donutOthersData: [],
        yAxisTitle: '',
        maxValueLength: 0,
      };
    }
    default:
      return {
        transformedData: dataWithDataType?.[0] ?? [],
        stackedValues,
        showCurrency: false,
        donutOthersData: [],
        yAxisTitle: '',
        maxValueLength: 0,
      };
  }
};
