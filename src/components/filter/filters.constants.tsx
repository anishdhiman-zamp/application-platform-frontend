import { FILTER_TYPES } from 'components/filter/filter.types';
import AmountRangeFilterMenuItem from 'components/filter/filterMenu/AmountRangeFilterMenuItem';
import DateRangeFilterMenuItem from 'components/filter/filterMenu/DateRangeFilterMenuItem';
import MultiSelectFilterMenuItem from 'components/filter/filterMenu/MultiSelectFilterMenuItem';
import SearchFilterMenuItem from 'components/filter/filterMenu/SearchFilterMenuItem';

export enum CONDITION_OPERATOR_TYPE {
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  ARRAY_CONTAINS = 'array_contains',
  IS_NULL = 'is_null',
  NOT_CONTAINS = 'ncontains',
  EQUAL = 'eq',
  NOT_EQUAL = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  ONE_OF = 'iof',
  DEBIT = 'debit',
  CREDIT = 'credit',
  ANY = 'any',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',
  IN_BETWEEN = 'inbetween',
}

export enum FILTER_PERIODICITIES {
  YEARLY = 'yearly',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

export enum FILTER_KEYS {
  DATE_RANGE = 'date_range',
}

export enum RANGE_FILTER_VALUES {
  IS_EQUAL_TO = 'is_equal_to',
  IS_NOT_EQUAL_TO = 'is_not_equal_to',
  IN_BETWEEN = 'in_between',
  IS_GREATER_THAN = 'is_greater_than',
  IS_LESS_THAN = 'is_less_than',
}

export const AMOUNT_RANGE_TYPE_SYMBOL_MAP = {
  [RANGE_FILTER_VALUES.IS_EQUAL_TO]: '=',
  [RANGE_FILTER_VALUES.IS_GREATER_THAN]: '>',
  [RANGE_FILTER_VALUES.IS_LESS_THAN]: '<',
  [RANGE_FILTER_VALUES.IN_BETWEEN]: 'in between',
};

export const AG_GRID_FILTER_TYPES = {
  [FILTER_TYPES.SEARCH]: SearchFilterMenuItem,
  [FILTER_TYPES.DATE_RANGE]: DateRangeFilterMenuItem,
  [FILTER_TYPES.AMOUNT_RANGE]: AmountRangeFilterMenuItem,
  [FILTER_TYPES.MULTI_SELECT]: MultiSelectFilterMenuItem,
};

export const AG_GRID_FILTER_OPERATORS = {
  [FILTER_TYPES.SEARCH]: 'agTextColumnFilter',
  [FILTER_TYPES.DATE_RANGE]: 'agDateColumnFilter',
  [FILTER_TYPES.AMOUNT_RANGE]: 'agNumberColumnFilter',
  [FILTER_TYPES.MULTI_SELECT]: 'agMultiSelectColumnFilter',
};

export const AG_GRID_FILTER_OPTIONS = {
  [FILTER_TYPES.AMOUNT_RANGE]: [
    'equals',
    'notEqual',
    'lessThan',
    'lessThanOrEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'inRange',
  ],
  [FILTER_TYPES.SEARCH]: ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith'],
};

export const AMOUNT_RANGE_FILTER_OPTIONS = [
  { label: 'is equal to', value: CONDITION_OPERATOR_TYPE.EQUAL },
  { label: 'does not equal to', value: CONDITION_OPERATOR_TYPE.NOT_EQUAL },
  { label: 'is greater than', value: CONDITION_OPERATOR_TYPE.GREATER_THAN },
  { label: 'is greater than or equal to', value: CONDITION_OPERATOR_TYPE.GREATER_THAN_EQUAL },
  { label: 'is less than', value: CONDITION_OPERATOR_TYPE.LESS_THAN },
  { label: 'is less than or equal to', value: CONDITION_OPERATOR_TYPE.LESS_THAN_EQUAL },
  { label: 'is between', value: CONDITION_OPERATOR_TYPE.IN_BETWEEN },
];

export const MULTI_SELECT_FILTER_OPTIONS = [
  { label: 'contains', value: CONDITION_OPERATOR_TYPE.CONTAINS },
  { label: 'does not contain', value: CONDITION_OPERATOR_TYPE.NOT_CONTAINS },
  { label: 'equals', value: CONDITION_OPERATOR_TYPE.EQUAL },
  { label: 'does not equal', value: CONDITION_OPERATOR_TYPE.NOT_EQUAL },
  { label: 'begins with', value: CONDITION_OPERATOR_TYPE.STARTS_WITH },
  { label: 'ends with', value: CONDITION_OPERATOR_TYPE.ENDS_WITH },
];
