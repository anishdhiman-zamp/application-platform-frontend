import { IServerSideGetRowsRequest, themeQuartz } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import {
  AggregationType,
  FilterModelType,
  FilterType,
  GroupByType,
  LogicalOperatorType,
  OrderByType,
  OrderType,
  RequestType,
} from 'types/components/table.type';
import {
  AggregationFunctionMap,
  ArrayFilters,
  LogicalOperatorMap,
  PAGE_SIZE,
} from 'components/common/table/table.constants';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

const getFiltersFromGroupKeys = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): FilterType[] => {
  const { groupKeys, rowGroupCols } = request;

  if (!groupKeys.length || !rowGroupCols.length) {
    return [];
  }

  return groupKeys?.map((key, index) => ({
    column: {
      column: rowGroupCols?.[index]?.id,
      datatype: columnDataTypeMapping[rowGroupCols?.[index]?.id],
      alias: rowGroupCols?.[index]?.id,
    },
    operator: CONDITION_OPERATOR_TYPE.EQUAL,
    value: key,
  }));
};

const getConditionValues = (condition: MapAny, columnDataTypeMapping: Record<string, string>): FilterType | null => {
  switch (condition.filterType) {
    case FILTER_TYPES.AMOUNT_RANGE:
      if (condition.type === CONDITION_OPERATOR_TYPE.IN_BETWEEN) {
        if (condition.filterTo !== '' && condition.filter !== '')
          return {
            column: {
              column: condition.colId,
              datatype: columnDataTypeMapping[condition.colId],
              alias: condition.colId,
            },
            operator: condition.type,
            value: [Number(condition.filter), Number(condition.filterTo)],
          };
        else return null;
      } else if (condition.filter !== '') {
        return {
          column: {
            column: condition.colId,
            datatype: columnDataTypeMapping[condition.colId],
            alias: condition.colId,
          },
          operator: condition.type,
          value: Number(condition.filter),
        };
      } else return null;
    case FILTER_TYPES.MULTI_SELECT:
      if (condition.values.length) {
        return {
          column: {
            column: condition.colId,
            datatype: columnDataTypeMapping[condition.colId],
            alias: condition.colId,
          },
          operator: condition.type,
          value: condition.values,
        };
      } else return null;
    case FILTER_TYPES.DATE_RANGE:
      if (condition.dateFrom && condition.dateTo) {
        return {
          column: {
            column: condition.colId,
            datatype: columnDataTypeMapping[condition.colId],
            alias: condition.colId,
          },
          operator: condition.type,
          value: [condition.dateFrom, condition.dateTo],
        };
      } else return null;
    case FILTER_TYPES.SEARCH:
      return {
        column: {
          column: condition.colId,
          datatype: columnDataTypeMapping[condition.colId],
          alias: condition.colId,
        },
        operator: condition.type,
        value: ArrayFilters.includes(condition.type) ? [condition.filter] : condition.filter,
      };
    default:
      return null;
  }
};

const parseCondition = (condition: MapAny, columnDataTypeMapping: Record<string, string>): FilterType | null => {
  if (condition.conditions) {
    return {
      logicalOperator: LogicalOperatorMap[condition.type] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: condition.conditions.map((cond: MapAny) => parseCondition(cond, columnDataTypeMapping)),
    };
  } else {
    return getConditionValues(condition, columnDataTypeMapping);
  }
};

const convertToFilterModel = (
  input: MapAny | null,
  columnDataTypeMapping: Record<string, string>,
): FilterModelType | null => {
  if (!input) {
    return null;
  } else if (input.filterType === 'join') {
    return {
      logicalOperator: LogicalOperatorMap[input.type] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: input.conditions
        .map((condition: MapAny) => parseCondition(condition, columnDataTypeMapping))
        .filter((condition: MapAny) => condition !== null),
    };
  } else if (input.conditions) {
    return {
      logicalOperator: LogicalOperatorMap[input.operator] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: input.conditions
        .map((condition: MapAny) => parseCondition(condition, columnDataTypeMapping))
        .filter((condition: MapAny) => condition !== null),
    };
  } else {
    const keys = Object.keys(input);

    if (keys.length) {
      const formattedConditions = keys.map((key) => ({ colId: key, ...input?.[key] }));
      const conditions = formattedConditions
        .map((condition: MapAny) => parseCondition(condition, columnDataTypeMapping))
        .filter((condition: MapAny | null) => condition !== null);

      if (conditions.length) {
        return {
          logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
          conditions,
        };
      } else return null;
    }

    return null;
  }
};

const getFilterModelFromGroupAndFilterModel = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): FilterModelType | null => {
  const filtersFromGroup = getFiltersFromGroupKeys(request, columnDataTypeMapping);
  const filtersFromFilterModel = convertToFilterModel(request.filterModel, columnDataTypeMapping);

  if (filtersFromGroup.length) {
    return {
      logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
      conditions: filtersFromFilterModel ? [...filtersFromGroup, filtersFromFilterModel] : filtersFromGroup,
    };
  }

  return filtersFromFilterModel;
};

const getGroupByColumns = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): GroupByType[] => {
  const { rowGroupCols, groupKeys } = request;
  const rowGroupsToBeUsed = groupKeys.length ? rowGroupCols.slice(groupKeys.length) : rowGroupCols;

  if (rowGroupsToBeUsed.length) {
    return [
      {
        column: {
          column: rowGroupsToBeUsed[0]?.id,
          datatype: columnDataTypeMapping[rowGroupsToBeUsed[0]?.id],
          alias: rowGroupsToBeUsed[0]?.displayName,
        },
        alias: rowGroupsToBeUsed[0]?.displayName,
      },
    ];
  }

  return [];
};

const getAggregations = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): AggregationType[] => {
  const { valueCols, rowGroupCols, groupKeys } = request;

  if (rowGroupCols.length === groupKeys.length) {
    return [];
  }

  return valueCols.map((item) => ({
    column: {
      column: item.id,
      datatype: columnDataTypeMapping[item.id],
      alias: item.id,
    },
    alias: item.id,
    function: AggregationFunctionMap[item?.aggFunc ?? 'sum'],
  }));
};

const getOrderByColumns = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): OrderByType[] => {
  const { sortModel } = request;

  return sortModel.map((item) => ({
    column: {
      column: item.colId,
      datatype: columnDataTypeMapping[item.colId],
      alias: item.colId,
    },
    order: item.sort as OrderType,
  }));
};

const formatRequest = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): RequestType => {
  const { endRow } = request;

  return {
    filters: getFilterModelFromGroupAndFilterModel(request, columnDataTypeMapping),
    aggregations: getAggregations(request, columnDataTypeMapping),
    groupBy: getGroupByColumns(request, columnDataTypeMapping),
    orderBy: getOrderByColumns(request, columnDataTypeMapping),
    pagination: {
      page: endRow ? Math.ceil(endRow / PAGE_SIZE) : 1,
      pageSize: PAGE_SIZE,
    },
  };
};

export const encodeRequest = (request: RequestType): string => {
  const jsonString = JSON.stringify(request);

  return jsonString;
};

export const getEncodedRequest = (
  request: IServerSideGetRowsRequest,
  columnDataTypeMapping: Record<string, string>,
): string => {
  const formattedRequest = formatRequest(request, columnDataTypeMapping);
  const encodedRequest = encodeRequest(formattedRequest);

  return encodedRequest;
};

export const getDataTableTheme = (params: MapAny) => themeQuartz.withParams(params);
