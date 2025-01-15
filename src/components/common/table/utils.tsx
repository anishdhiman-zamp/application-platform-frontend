import { IServerSideGetRowsRequest } from 'ag-grid-community';
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
  OperatorMap,
  PAGE_SIZE,
} from 'components/common/table/constants';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

const getFiltersFromGroupKeys = (request: IServerSideGetRowsRequest): FilterType[] => {
  const { groupKeys, rowGroupCols } = request;

  if (!groupKeys.length || !rowGroupCols.length) {
    return [];
  }

  return groupKeys?.map((key, index) => ({
    column: rowGroupCols?.[index]?.id,
    operator: CONDITION_OPERATOR_TYPE.EQUAL,
    value: key,
  }));
};

const parseCondition = (condition: MapAny): FilterType => {
  if (condition.conditions) {
    return {
      logicalOperator: LogicalOperatorMap[condition.type] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: condition.conditions.map((cond: MapAny) => parseCondition(cond)),
    };
  } else {
    return {
      column: condition.colId,
      operator: OperatorMap[condition.type] || CONDITION_OPERATOR_TYPE.EQUAL,
      value: ArrayFilters.includes(OperatorMap[condition.type]) ? [condition.values] : condition.values,
    };
  }
};

const convertToFilterModel = (input: MapAny | null): FilterModelType | null => {
  if (!input) {
    return null;
  } else if (input.filterType === 'join') {
    return {
      logicalOperator: LogicalOperatorMap[input.type] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: input.conditions.map((condition: MapAny) => parseCondition(condition)),
    };
  } else if (input.conditions) {
    return {
      logicalOperator: LogicalOperatorMap[input.operator] || LogicalOperatorType.OperatorLogicalAnd,
      conditions: input.conditions.map((condition: MapAny) => parseCondition(condition)),
    };
  } else {
    const keys = Object.keys(input);

    if (keys.length) {
      return {
        logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
        conditions: keys.map((key) => ({
          column: key,
          operator: OperatorMap[input[key].type] || CONDITION_OPERATOR_TYPE.EQUAL,
          value: ArrayFilters.includes(OperatorMap[input[key].type]) ? [input[key].values] : input[key].values,
        })),
      };
    }

    return null;
  }
};

const getFilterModelFromGroupAndFilterModel = (request: IServerSideGetRowsRequest): FilterModelType | null => {
  const filtersFromGroup = getFiltersFromGroupKeys(request);
  const filtersFromFilterModel = convertToFilterModel(request.filterModel);

  if (filtersFromGroup.length) {
    return {
      logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
      conditions: filtersFromFilterModel ? [...filtersFromGroup, filtersFromFilterModel] : filtersFromGroup,
    };
  }

  return filtersFromFilterModel;
};

const getGroupByColumns = (request: IServerSideGetRowsRequest): GroupByType[] => {
  const { rowGroupCols, groupKeys } = request;

  const rowGroupsToBeUsed = groupKeys.length ? rowGroupCols.slice(groupKeys.length) : rowGroupCols;

  if (rowGroupsToBeUsed.length) {
    return [
      {
        column: rowGroupsToBeUsed[0]?.id,
        alias: rowGroupsToBeUsed[0]?.displayName,
      },
    ];
  }

  return [];
};

const getAggregations = (request: IServerSideGetRowsRequest): AggregationType[] => {
  const { valueCols, rowGroupCols, groupKeys } = request;

  if (rowGroupCols.length === groupKeys.length) {
    return [];
  }

  return valueCols.map((item) => ({
    column: item.id,
    alias: item.id,
    function: AggregationFunctionMap[item?.aggFunc ?? 'sum'],
  }));
};

const getOrderByColumns = (request: IServerSideGetRowsRequest): OrderByType[] => {
  const { sortModel } = request;

  return sortModel.map((item) => ({
    column: item.colId,
    order: item.sort as OrderType,
  }));
};

const formatRequest = (request: IServerSideGetRowsRequest): RequestType => {
  const { endRow } = request;

  return {
    filters: getFilterModelFromGroupAndFilterModel(request),
    aggregations: getAggregations(request),
    groupBy: getGroupByColumns(request),
    orderBy: getOrderByColumns(request),
    getTotalRecords: true,
    pagination: {
      page: endRow ? Math.ceil(endRow / PAGE_SIZE) : 1,
      pageSize: PAGE_SIZE,
    },
  };
};

const encodeRequest = (request: RequestType): string => {
  const jsonString = JSON.stringify(request);

  return jsonString;
};

export const getEncodedRequest = (request: IServerSideGetRowsRequest): string => {
  const formattedRequest = formatRequest(request);
  const encodedRequest = encodeRequest(formattedRequest);

  return encodedRequest;
};
