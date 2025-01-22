import { CONDITION_OPERATOR_TYPE } from "components/filter/filters.constants";

export enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
  }
  
  export enum LogicalOperatorType {
    OperatorLogicalAnd = 'AND',
    OperatorLogicalOr = 'OR',
  }
  
  export enum AggregationFunctionType {
    AggregationFunctionSum = 'SUM',
    AggregationFunctionAvg = 'AVG',
    AggregationFunctionMin = 'MIN',
    AggregationFunctionMax = 'MAX',
    AggregationFunctionCount = 'COUNT',
  }

  export type ColumnConfig = {
    column: string;
    datatype: string;
    alias: string;
  }

  export type FilterType = {
    logicalOperator?: LogicalOperatorType;
    column?: ColumnConfig;
    operator?: CONDITION_OPERATOR_TYPE;
    value?: any;
    conditions?: FilterType[];
  };
  
  export type AggregationType = {
    column: ColumnConfig;
    alias: string;
    function: AggregationFunctionType;
  };
  
  export type GroupByType = {
    column: ColumnConfig;
    alias: string;
  };
  
  export type OrderByType = {
    column: ColumnConfig;
    order: OrderType;
  };
  
  export type PaginationType = {
    page: number;
    pageSize: number;
  };
  
  export type FilterModelType = {
    logicalOperator?: LogicalOperatorType;
    conditions?: FilterType[];
  };
  
  export type RequestType = {
    filters: FilterModelType | null;
    aggregations: AggregationType[];
    groupBy: GroupByType[];
    orderBy: OrderByType[];
    pagination: PaginationType;
    getTotalRecords: boolean;
  };