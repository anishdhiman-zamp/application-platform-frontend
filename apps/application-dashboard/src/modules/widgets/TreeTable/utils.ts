import { PERIODICITY_TYPES } from 'constants/date.constants';
import { ColumnFilterConfig, PIVOT_DATA_TYPES } from 'modules/widgets/Pivot/pivot.types';
import { parseType } from 'modules/widgets/Pivot/pivot.utils';
import { getDateRangeWithPeriodicity } from 'modules/widgets/widgets.utils';
import { PivotTableWidgetInstanceType, WidgetDataResponseType } from 'types/api/widgets.types';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const getTransformedTreeData = (
  data: WidgetDataResponseType,
  periodicity: PERIODICITY_TYPES,
  widgetInstanceDetails: PivotTableWidgetInstanceType,
): {
  columnsHeaders: { field: unknown }[];
  transformedData: any[];
  mappingDatasets: Record<string, string>;
  pathColumns: string[];
} => {
  console.log(widgetInstanceDetails);

  // Merge all results' columns and data
  const dataResult = data.result[0];

  const pathColumns = dataResult.columns.map((col) => col.column_name);

  console.log(pathColumns);

  const columnsHeadersSet = new Set();

  // Merge all data from different results
  const mergedData = dataResult.data;

  // Create a map to group items by their path
  const groupedByPath = mergedData.reduce((acc, item) => {
    //find the ref from the item
    const ref = item['__REF'];

    //find the mapping from the ref
    const mapping = widgetInstanceDetails.data_mappings.mappings.find((mapping) => mapping.ref === ref);

    //find the columns from the mapping
    const columns = mapping?.fields?.columns;

    //find the values from the mapping
    const values = mapping?.fields?.values;

    // for each column, parseType and add it the columnsHeadersSet
    if (!columns?.[0] || !values?.[0]) return acc;
    let parsedValue;

    try {
      parsedValue = parseType(
        columns[0].type as PIVOT_DATA_TYPES,
        item[columns[0].alias || columns[0].column],
        periodicity,
      );
      columnsHeadersSet.add(parsedValue);
    } catch (error) {
      console.log('error', error);
      console.log('columns', columns[0]);
      console.log('item', item);
    }

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
        [parsedValue?.toString() || '']: item[values?.[0]?.alias || values?.[0]?.column],
        data_keys: widgetInstanceDetails.data_mappings.mappings.find((mapping) => mapping.ref === item['__REF'])?.fields
          .columns,
      };
    } else {
      acc[pathKey][parsedValue?.toString() || ''] = item[values?.[0]?.alias || values?.[0]?.column];
    }

    return acc;
  }, {});

  // Convert dates set to array of objects
  const columnsHeaders = Array.from(columnsHeadersSet).map((header) => ({ field: header }));

  // Convert the grouped data map back to array
  const transformedData = Object.values(groupedByPath);

  const mappingDatasets = getWidgetMappingDatasets(widgetInstanceDetails);

  return {
    columnsHeaders,
    transformedData,
    mappingDatasets,
    pathColumns,
  };
};

export const getColDefs = (headers: any[], currency: string) => {
  return headers.map((item) => {
    return {
      field: item.field,
      aggFunc: 'sum',
      valueFormatter: (params: { value: number }) => {
        if (params.value) {
          return new Intl.NumberFormat('en-US', {
            style: currency ? 'currency' : 'decimal',
            currency: currency,
            maximumSignificantDigits: 3,
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

export const extractKey = (key: string) => {
  if (key.startsWith('__') && key.includes('_LEVEL_')) {
    const parts = key.split('_');

    if (parts.length >= 4) {
      return parts[2];
    }
  }

  return key;
};
