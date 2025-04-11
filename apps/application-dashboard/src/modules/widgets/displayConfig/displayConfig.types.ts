import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';

export const enum DISPLAY_CONFIG_CELL_TYPE {
  ROW_TITLE_CELL = 'row_title_cell',
  HEADER_CELL = 'header_cell',
  DATA_CELL = 'data_cell',
}

export const enum DISPLAY_CONFIG_RULES {
  LEVEL = 'level',
  VALUE_MATCH = 'value_match',
  HIDE = 'hide',
  TOGGLE = 'toggle',
}

export const enum LOGICAL_OPERATOR_CONDITIONS {
  AND = 'AND',
  OR = 'OR',
}

export const enum ALTERNATE_TYPE {
  BOTH = 'both',
  ODD = 'odd',
  EVEN = 'even',
}

export const DISPLAY_CONFIG_OPERATOR_TYPE_SYMBOL_MAP = {
  [CONDITION_OPERATOR_TYPE.EQUAL]: '===',
  [CONDITION_OPERATOR_TYPE.NOT_EQUAL]: '!=',
  [CONDITION_OPERATOR_TYPE.GREATER_THAN]: '>',
  [CONDITION_OPERATOR_TYPE.LESS_THAN]: '<',
  [CONDITION_OPERATOR_TYPE.GREATER_THAN_EQUAL]: '>=',
  [CONDITION_OPERATOR_TYPE.LESS_THAN_EQUAL]: '<=',
  [CONDITION_OPERATOR_TYPE.STARTS_WITH]: 'startswith',
  [CONDITION_OPERATOR_TYPE.CONTAINS]: 'contains',
  [CONDITION_OPERATOR_TYPE.NOT_CONTAINS]: 'ncontains',
};

export enum DisplayConfigRulesConditionsAliasType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
}

export enum DisplayConfigRulesConditionsPeriodType {
  TODAY = 'today',
  WEEKEND = 'weekend',
}
export type DisplayConfigRulesConditionsType = {
  level?: number;
  alternate_cell_number?: number;
  ref?: string;
  column_id?: string[];
  column_group_id?: string;
  row_group_field?: string;
  operator?: string;
  header_name?: string;
  period?: DisplayConfigRulesConditionsPeriodType;
  alias?: DisplayConfigRulesConditionsAliasType;
  hide?: boolean;
  value?: string;
  toggle_field?: string;
  toggle_title?: string;
  default?: boolean;
  style_properties?:
    | {
        [key: string]: string;
      }
    | {
        [key: string]: string;
      }[];
}[];

export type DisplayConfigRulesType = {
  type: DISPLAY_CONFIG_RULES;
  conditions?: DisplayConfigRulesConditionsType;
}[];

export type DisplayConfigStyleType = {
  [key in DISPLAY_CONFIG_CELL_TYPE]?: {
    rules: DisplayConfigRulesType;
  };
};
