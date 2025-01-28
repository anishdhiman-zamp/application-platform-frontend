import { AgChartOptions } from 'ag-charts-community';
import { CHART_PALETTE_COLORS, COLORS } from 'constants/colors';
import { AG_CHART_TYPES, WIDGET_TYPES, WidgetDataValueType, WidgetTypes } from 'modules/widgets/widgets.constant';
import { WidgetInstanceType } from 'types/api/pagesApi.types';
import { WidgetDataType } from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { LogicalOperatorType } from 'types/components/table.type';
import { shuffleArray } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { getConditionValues } from 'components/common/table/table.utils';
import { FilterConfigType } from 'components/filter/filter.types';

/**
 * Formats the data array based on the types specified in the columns array.
 * @param response - The response object containing columns and data.
 * @returns The formatted data array.
 */
export function transformData(responses: WidgetDataType[]) {
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

export const getChartOptions = (
  widgetDetails: WidgetInstanceType,
  widgetType: WIDGET_TYPES,
  onNodeClick: (clickedNode: MapAny, xAxis: string) => void,
  baseOptions: AgChartOptions,
) => {
  const mappings = widgetDetails?.data_mappings?.mappings;
  const xAxis = mappings?.[0]?.fields?.x_axis?.[0]?.column || '';
  const yAxis = mappings?.[0]?.fields?.y_axis ?? [];
  const chartType = AG_CHART_TYPES[widgetType as unknown as keyof typeof AG_CHART_TYPES];
  const navigatorConfig =
    baseOptions?.data && baseOptions?.data?.length > 5
      ? {
          navigator: {
            enabled: baseOptions?.data && baseOptions?.data?.length > 5,
            height: 10,
          },
          initialState: {
            zoom: { ratioX: { start: 0, end: 0.4 } },
          },
        }
      : {};

  const label = {
    enabled: true,
    fontSize: 11,
    fontWeight: 450,
    color: COLORS.GRAY_950,
    placement: 'outside-end',
    padding: 6,
    formatter: (params: any) => {
      if (Number(params.datum[params.yKey]) / 1000000 > 0.5)
        return (Number(params.datum[params.yKey]) / 1000000).toFixed(1).toString();
      else return '';
    },
  };

  switch (widgetType) {
    case WIDGET_TYPES.BAR_CHART: {
      return {
        ...baseOptions,
        ...navigatorConfig,
        series: yAxis.map((axis) => ({
          type: chartType,
          xKey: xAxis,
          cornerRadius: 2,
          yKey: `${axis?.aggregation}_${axis?.column}`,
          yName: axis?.column || '',
          stacked: true,
          fill: CHART_PALETTE_COLORS[0],
          listeners: {
            nodeClick: (event: any) => onNodeClick(event.datum, xAxis),
          },
          label,
        })),
      };
    }
    case WIDGET_TYPES.LINE_CHART: {
      return {
        ...baseOptions,
        ...navigatorConfig,
        series: yAxis.map((axis) => ({
          type: chartType,
          xKey: xAxis,
          yKey: `${axis?.aggregation}_${axis?.column}`,
          yName: axis?.column || '',
          stacked: true,
          stroke: CHART_PALETTE_COLORS[Math.floor(Math.random() * CHART_PALETTE_COLORS.length - 2)],
          marker: {
            enabled: false,
          },
          listeners: {
            nodeClick: (event: any) => onNodeClick(event.datum, xAxis),
          },
          label,
        })),
      };
    }
    case WIDGET_TYPES.PIE_CHART: {
      return {
        ...baseOptions,
        series: [
          {
            type: AG_CHART_TYPES[WidgetTypes.PIE_CHART],
            legendItemKey: mappings?.[0]?.fields?.slices?.[0]?.column,
            angleKey: mappings?.[0]?.fields?.values?.[0]?.aggregation
              ? `${mappings?.[0]?.fields?.values?.[0]?.aggregation}_${mappings?.[0]?.fields?.values?.[0]?.column}`
              : mappings?.[0]?.fields?.values?.[0]?.column,
            fills: shuffleArray([...CHART_PALETTE_COLORS]),
            listeners: {
              nodeClick: (event: any) => onNodeClick(event.datum, mappings?.[0]?.fields?.slices?.[0]?.column ?? ''),
            },
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
