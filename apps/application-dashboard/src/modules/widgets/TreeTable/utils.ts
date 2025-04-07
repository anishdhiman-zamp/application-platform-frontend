import { PERIODICITY_TYPES } from 'constants/date.constants';
import { ColumnFilterConfig, PIVOT_DATA_TYPES } from 'modules/widgets/Pivot/pivot.types';
import { parseType } from 'modules/widgets/Pivot/pivot.utils';
import { getDateRangeWithPeriodicity } from 'modules/widgets/widgets.utils';
import {
  PivotTableWidgetInstanceType,
  WIDGET_TYPES,
  WidgetColumnType,
  WidgetDataResponseType,
  WidgetInstanceType,
} from 'types/api/widgets.types';
import { MapAny } from 'types/commonTypes';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const getTreeData = (
  wInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>,
  wInstanceData: WidgetDataResponseType,
  periodicity: PERIODICITY_TYPES,
) => {
  const rows: MapAny[] = [];
  const { data_mappings } = wInstanceDetails;

  wInstanceData.result.forEach((resultSet) => {
    const resultRows = resultSet?.data;

    resultRows.forEach((row) => {
      const transformedRow = { ...row };
      const mapping = data_mappings.mappings[0];
      const { fields } = mapping;

      // Add tree path
      transformedRow.treePath = fields?.rows?.map((row) => row.column).map((col) => transformedRow[col]);

      // Add dataset ID for drilldown
      transformedRow.datasetId = mapping.dataset_id;

      // Transform values
      fields.values.forEach((val) => {
        transformedRow[val.alias || val.column] = parseType(val.type as PIVOT_DATA_TYPES, row[val.column], periodicity);
      });

      rows.push(transformedRow);
    });
  });

  return rows;
};

const sortingOrder = [
  '__REF',
  'account_tag',
  'account_name',
  'account_type',
  'entity_tag',
  'entity_name',
  'entity_type',
  'account_number',
];

export const getTransformedTreeData = (
  data: WidgetDataResponseType,
  periodicity: PERIODICITY_TYPES,
  widgetInstanceDetails: PivotTableWidgetInstanceType,
): {
  dates: { field: unknown }[];
  transformedData: any[];
  mappingDatasets: Record<string, string>;
  pathColumns: string[];
} => {
  // Merge all results' columns and data
  const mergedColumns = data.result.reduce<WidgetColumnType[]>((acc, curr) => {
    return [
      ...acc,
      ...curr.columns.filter(
        (col) =>
          col.column_name !== 'value' &&
          col.column_name !== 'date' &&
          !acc.some((existingCol) => existingCol.column_name === col.column_name),
      ),
    ];
  }, []);

  // Sort mergedColumns based on sortingOrder
  const sortedColumns = [...mergedColumns].sort((a, b) => {
    const indexA = sortingOrder.indexOf(a.column_name);
    const indexB = sortingOrder.indexOf(b.column_name);

    // If both columns are in sortingOrder, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one column is in sortingOrder, it should come first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither column is in sortingOrder, maintain original order
    return 0;
  });

  const pathColumns = sortedColumns.map((col) => col.column_name);
  const datesSet = new Set();

  // Merge all data from different results
  const mergedData = data.result.reduce<MapAny[]>((acc, curr) => {
    return [...acc, ...curr.data];
  }, []);

  // Create a map to group items by their path
  const groupedByPath = mergedData.reduce((acc, item) => {
    // Add date to the set
    const readableDate = parseType(PIVOT_DATA_TYPES.DATE, item.date, periodicity);

    datesSet.add(readableDate);

    // Create path string for grouping
    const path = pathColumns.map((columnName) => item[columnName]).filter(Boolean);
    const pathKey = JSON.stringify(path);

    if (!acc[pathKey]) {
      // Create nested structure with keys for each level
      const pathWithKeys = pathColumns
        .map((columnName) => {
          const value = item[columnName];

          if (!value) return null;

          return {
            value,
            key: columnName,
            level: columnName,
          };
        })
        .filter(Boolean);

      acc[pathKey] = {
        path: pathWithKeys,
        [readableDate.toString()]: item.value,
        data_keys: widgetInstanceDetails.data_mappings.mappings.find((mapping) => mapping.ref === item['__REF'])?.fields
          .columns,
      };
    } else {
      acc[pathKey][readableDate.toString()] = item.value;
    }

    return acc;
  }, {});

  // Convert dates set to array of objects
  const dates = Array.from(datesSet).map((date) => ({ field: date }));

  // Convert the grouped data map back to array
  const transformedData = Object.values(groupedByPath);

  const mappingDatasets = getWidgetMappingDatasets(widgetInstanceDetails);

  return {
    dates,
    transformedData,
    mappingDatasets,
    pathColumns,
  };
};

export const getColDefs = (dates: any[], currency: string) => {
  return dates.map((item) => {
    return {
      field: item.field,
      aggFunc: 'sum',
      valueFormatter: (params: { value: number }) => {
        if (params.value) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
          }).format(params.value);
        }

        return '';
      },
    };
  });
};

export const getWidgetMappingDatasets = (widgetInstance: PivotTableWidgetInstanceType): Record<string, string> => {
  const { data_mappings } = widgetInstance;
  const mappingDatasets: Record<string, string> = {};

  data_mappings?.mappings?.forEach((mapping) => {
    mappingDatasets[mapping?.ref] = mapping?.dataset_id;
  });

  return mappingDatasets;
};

export const getFilterContext = (
  widgetInstance: PivotTableWidgetInstanceType,
): Record<string, Record<string, ColumnFilterConfig>> => {
  const { data_mappings } = widgetInstance;

  const columnFilterConfigs: Record<string, Record<string, ColumnFilterConfig>> = {};

  data_mappings?.mappings?.forEach((mapping) => {
    if (!columnFilterConfigs[mapping?.ref]) {
      columnFilterConfigs[mapping?.ref] = {};
    }

    const { fields } = mapping;

    fields?.rows?.forEach((row) => {
      columnFilterConfigs[mapping?.ref][row?.column] = {
        column: row?.column,
        filterType: row?.drilldown_filter_type as FILTER_TYPES,
        type: row?.drilldown_filter_operator as CONDITION_OPERATOR_TYPE,
      } as ColumnFilterConfig;
    });

    fields?.columns?.forEach((col) => {
      columnFilterConfigs[mapping?.ref][col?.column] = {
        column: col?.column,
        filterType: col?.drilldown_filter_type as FILTER_TYPES,
        type: col?.drilldown_filter_operator as CONDITION_OPERATOR_TYPE,
      } as ColumnFilterConfig;
    });
  });

  return columnFilterConfigs;
};

export const getColumnLevelFilters = (
  columnContextFilters: Record<string, ColumnFilterConfig>,
  currentDateConfig: {
    periodicity: PERIODICITY_TYPES;
    widgetSelectedFilter: Record<string, any>;
  },
  keys: { column: string; key: string }[],
  columnKey: string,
): Record<string, any> => {
  // holds the column level filters
  const columnLevelFilters: Record<string, any> = {};

  if (!keys) return columnLevelFilters;

  keys.forEach(({ column }) => {
    const columnColumnFilterConfig = columnContextFilters[column];

    console.log(columnContextFilters, column, columnKey);

    if (columnColumnFilterConfig) {
      columnLevelFilters[columnColumnFilterConfig?.column] = columnColumnFilterConfig;
      switch (columnColumnFilterConfig.filterType) {
        case FILTER_TYPES.MULTI_SELECT: {
          columnLevelFilters[columnColumnFilterConfig.column].values = [column];
          break;
        }
        case FILTER_TYPES.SEARCH: {
          columnLevelFilters[columnColumnFilterConfig.column].values = [column];
          break;
        }
        case FILTER_TYPES.DATE_RANGE: {
          const [updatedDateFrom, updatedDateTo] = getDateRangeWithPeriodicity(
            currentDateConfig.periodicity,
            columnKey,
            currentDateConfig.widgetSelectedFilter[columnColumnFilterConfig.column]?.dateFrom,
            currentDateConfig.widgetSelectedFilter[columnColumnFilterConfig.column]?.dateTo,
          );

          columnLevelFilters[columnColumnFilterConfig.column].dateFrom = updatedDateFrom;
          columnLevelFilters[columnColumnFilterConfig.column].dateTo = updatedDateTo;
          break;
        }
      }
    }
  });

  return columnLevelFilters;
};
