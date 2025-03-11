import { ColDef, IServerSideGetRowsRequest, ValueFormatterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { CHIP_COLORS } from 'constants/colors';
import { DATE_FORMATS, VALID_DATE_FORMATS } from 'constants/date.constants';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  format,
  isValid,
} from 'date-fns';
import { CustomColumnsMapping } from 'modules/data/data.constants';
import {
  DatasetFilterConfigResponseType,
  DatasetType,
  DatasetUpdateResponseType,
  RuleFilters,
  ValueFormatType,
} from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { AggregationFunctionType, FilterModelType, LogicalOperatorType } from 'types/components/table.type';
import { createDateObjectFromUTCString, formatPlural, getChipColor, getCommaSeparatedNumber } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import CustomDateTimeEditor from 'components/common/table/CustomCellEditors/CustomDateTimeEditor';
import CustomTagEditor from 'components/common/table/CustomCellEditors/CustomTagEditor';
import { CUSTOM_COLUMNS_TYPE, VALUE_FORMAT_TYPE } from 'components/common/table/table.types';
import { getEncodedRequest } from 'components/common/table/table.utils';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { AG_GRID_FILTER_TYPES, CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const findTimeDifference = (updated_at: string): string => {
  const currentTime = new Date();
  const lastUpdatedTime = createDateObjectFromUTCString(updated_at);

  const differenceInMinutesValue = differenceInMinutes(currentTime, lastUpdatedTime);

  if (differenceInMinutesValue < 60) {
    return `${formatPlural(differenceInMinutesValue, 'minute')} ago`;
  }

  const differenceInHoursValue = differenceInHours(currentTime, lastUpdatedTime);

  if (differenceInHoursValue < 24) {
    return `${formatPlural(differenceInHoursValue, 'hour')} ago`;
  }

  const differenceInDaysValue = differenceInDays(currentTime, lastUpdatedTime);

  if (differenceInDaysValue < 30) {
    return `${formatPlural(differenceInDaysValue, 'day')} ago`;
  }

  const differenceInMonthsValue = differenceInMonths(currentTime, lastUpdatedTime);

  return `${formatPlural(differenceInMonthsValue, 'month')} ago`;
};

export const formatData = (data: DatasetType[]): DatasetType[] => {
  return data.map((item) => ({
    ...item,
    updated_at: findTimeDifference(item.updated_at),
  }));
};

export const formatColumns = (
  filterConfig: DatasetFilterConfigResponseType[],
  isInitiatedAction: boolean,
  datasetId: string,
  handleSuccessfulUpdate: (data: DatasetUpdateResponseType) => void,
  tableRef: React.RefObject<AgGridReact>,
  handleRulesListingSideDrawerOpen: (columnId: string) => void,
  zampIds?: string[],
): ColDef[] => {
  const columns: ColDef[] = [];

  filterConfig?.forEach((column: DatasetFilterConfigResponseType) => {
    const columnNameLength = column?.alias?.length ?? column?.column?.length;
    let formattedColumn: ColDef = {
      field: column?.column,
      flex: 1,
      hide: column?.metadata?.is_hidden,
      cellRendererParams: column?.metadata,
      editable: column?.metadata?.is_editable && !isInitiatedAction,
      suppressFillHandle: !column?.metadata?.is_editable,
      filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
      filterParams: {
        values: column?.options,
      },
      headerName: column?.alias,
      minWidth: columnNameLength > 17 ? 150 + 7 * (columnNameLength - 17) : 150,
    };

    formattedColumn.cellRenderer = CustomColumnsMapping[column.metadata?.custom_type as CUSTOM_COLUMNS_TYPE];
    formattedColumn = { ...formattedColumn, ...getCellEditorConfig(column) };

    formattedColumn.headerComponentParams = {
      metadata: column?.metadata,
      datasetId,
      options: column?.options?.filter((option) => option !== null),
      handleSuccessfulUpdate,
      tableRef,
      handleRulesListingSideDrawerOpen,
      zampIds,
      filterType: column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG ? FILTER_TYPES.TAGS : column?.type,
    };

    if (column?.metadata?.config?.value_format) {
      formattedColumn = { ...formattedColumn, valueFormatter: getValueFormatter(column) };
    }

    if (column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
      const tagColorMap: MapAny = {};

      column?.options?.forEach((option) => {
        if (option) {
          if (!tagColorMap[option]) {
            tagColorMap[option] = getChipColor(CHIP_COLORS);
          }
        }
      });
      formattedColumn.cellRendererParams = { ...formattedColumn.cellRendererParams, tagColorMap };
      formattedColumn.headerComponentParams = {
        ...formattedColumn.headerComponentParams,
        filterComponentProps: { tagColorMap },
      };
      formattedColumn.cellEditorParams = {
        ...formattedColumn.cellEditorParams,
        tagColorMap,
      };
    }

    if (!column?.metadata?.is_hidden) {
      columns.push(formattedColumn);
    }
  });

  // re-order columns based on the columnOrderingVisibilityForCurrentDataset
  const orderedColumns: ColDef[] =
    getColumnOrderingVisibilityForCurrentDataset(datasetId)?.map((column: MapAny) => {
      return { ...columns.find((col) => col.field === column.colId), hide: !column.isVisible };
    }) ?? [];

  return orderedColumns?.length ? orderedColumns : columns;
};

export const getCellEditorConfig = (column: DatasetFilterConfigResponseType) => {
  if (column.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG) {
    return {
      cellEditor: CustomTagEditor,
      cellEditorParams: {
        values: column.options.filter((option) => !!option),
      },
    };
  }

  switch (column?.type) {
    case FILTER_TYPES.MULTI_SELECT:
      return {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: column.options,
          allowTyping: true,
          filterList: true,
          highlightMatch: true,
          searchType: 'match',
          cellHeight: 32,
        },
      };
    case FILTER_TYPES.SEARCH:
      return {
        cellEditor: 'agTextCellEditor',
      };
    case FILTER_TYPES.AMOUNT_RANGE:
      return {
        cellEditor: 'agNumberCellEditor',
      };
    case FILTER_TYPES.DATE_RANGE:
      return {
        cellEditor: CustomDateTimeEditor,
      };
  }
};

export const convertApiFiltersToRuleFilters = (filters?: RuleFilters): MapAny => {
  if (!filters) return {};
  const { conditions } = filters;
  const filtersConfig: MapAny = {};

  conditions.forEach((condition) => {
    const { column, operator, value } = condition;

    filtersConfig[column.column] = {
      filterType: FILTER_TYPES.MULTI_SELECT,
      type: operator,
      values: value,
    };
  });

  return filtersConfig;
};

export const getColumnOrderingVisibilityForCurrentDataset = (datasetId: string) => {
  const currentColumnOrderingVisibility = JSON.parse(
    getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}',
  );

  return currentColumnOrderingVisibility[datasetId];
};

export const getFilters = (filtersString: string, filterConfig: DatasetFilterConfigResponseType[]) => {
  const filters = JSON.parse(filtersString);
  const filterKeys = Object.keys(filters);

  const requiredTagFilterConfigs = filterConfig.filter(
    (item) => item.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG && filterKeys.includes(item.column),
  );

  requiredTagFilterConfigs.forEach((item) => {
    const startsWithValues: string = filters[item.column]?.values?.[0];

    filters[item.column] = {
      filterType: FILTER_TYPES.MULTI_SELECT,
      type: CONDITION_OPERATOR_TYPE.CONTAINS,
      values: item.options.filter((option) => option && option.startsWith(startsWithValues)),
    };
  });

  const requiredSearchFilterConfigs = filterConfig.filter(
    (item) => item.type === FILTER_TYPES.SEARCH && filterKeys.includes(item.column),
  );

  requiredSearchFilterConfigs.forEach((item) => {
    const filterValue = filters[item.column];

    filters[item.column] = {
      filterType: filterValue?.filterType,
      type: filterValue?.type,
      filter: filterValue?.values?.[0],
    };
  });

  return filters;
};

export const getValueFormatter = (
  column: DatasetFilterConfigResponseType,
): ((params: ValueFormatterParams) => string) => {
  const valueFormatter = (params: ValueFormatterParams) => {
    let formattedValue = params.value;
    const valueFormats = Array.isArray(column.metadata?.config?.value_format)
      ? column.metadata?.config?.value_format
      : [column.metadata?.config?.value_format];

    valueFormats?.forEach((valueFormat) => {
      switch (valueFormat?.type) {
        case VALUE_FORMAT_TYPE.ROUND_OFF:
          formattedValue = getCommaSeparatedNumber(Number(formattedValue), valueFormat?.value as number);
          break;
        case VALUE_FORMAT_TYPE.DATE_TIME:
          formattedValue = getFormattedDate(valueFormat, formattedValue);
          break;
        case VALUE_FORMAT_TYPE.PREFIX:
          formattedValue = getFormattedValueWithPrefix(valueFormat, formattedValue);
          break;
        case VALUE_FORMAT_TYPE.COLUMN_PREFIX:
          formattedValue = getFormattedValueWithColumnPrefix(valueFormat, formattedValue, params.data);
          break;
      }
    });

    return formattedValue;
  };

  return valueFormatter;
};

const getFormattedDate = (valueFormat: ValueFormatType, value: string) => {
  const dateFormat = valueFormat?.value as string;
  const validDateFormat = VALID_DATE_FORMATS.includes(dateFormat) ? dateFormat : DATE_FORMATS.ddMMMyyyy;
  const date = new Date(value);

  return isValid(date) ? format(date, validDateFormat) : value;
};

const getFormattedValueWithPrefix = (valueFormat: ValueFormatType, value: string) => {
  const prefix = valueFormat?.value ?? '';

  return prefix && value ? `${prefix} ${value}` : value;
};

const getFormattedValueWithColumnPrefix = (valueFormat: ValueFormatType, value: string, data: MapAny) => {
  const columnToBeUsedForPrefix = valueFormat?.value ?? '';
  const prefixValue = data?.[columnToBeUsedForPrefix]?.toUpperCase();

  return prefixValue && value ? `${prefixValue} ${value}` : value;
};

export const convertFilterModelToRuleFilters = (filterModel: FilterModelType | null): RuleFilters | null => {
  if (!filterModel) return null;

  const ruleFilters: RuleFilters = {
    logical_operator: filterModel.logical_operator ?? LogicalOperatorType.OperatorLogicalAnd,
    conditions: [],
  };

  filterModel.conditions?.forEach((condition) => {
    ruleFilters.conditions.push({
      logical_operator: condition.logicalOperator ?? LogicalOperatorType.OperatorLogicalAnd,
      column: {
        column: condition.column as string,
        datatype: '',
        custom_data_config: {},
        alias: '',
      },
      operator: condition.operator ?? CONDITION_OPERATOR_TYPE.EQUAL,
      value: condition.value,
    });
  });

  return ruleFilters;
};

const getAggregations = (colIds: string[]): MapAny => {
  const valueCols: MapAny[] = [];

  colIds.forEach((colId) => {
    const valueCol = [
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionSum.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionSum}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionAvg.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionAvg}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMin.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionMin}`,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMax.toLowerCase(),
        displayName: `${colId} ${AggregationFunctionType.AggregationFunctionMax}`,
      },
    ];

    valueCols.push(...valueCol);
  });

  return { valueCols };
};

export const getEncodedRequestWithAggregations = (colIds: string[]) =>
  getEncodedRequest(getAggregations(colIds) as IServerSideGetRowsRequest, '', [], true, true, true);

export const formatColumnLevelStats = (columnLevelStatsData?: MapAny): MapAny => {
  if (!columnLevelStatsData) return {};
  const columnLevelStats: MapAny = {};

  Object.entries(columnLevelStatsData).forEach(([key, value]) => {
    const [column, aggFunction] = key.split(' ');

    columnLevelStats[column] = {
      ...columnLevelStats[column],
      [aggFunction]: value,
    };
  });

  return columnLevelStats;
};
