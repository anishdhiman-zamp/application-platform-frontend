import { AllPivotColumnsToHideType } from 'modules/widgets/Pivot/pivot.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { MapAny } from '@/types/commonTypes';

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

export enum CALENDER_DAYS {
  MONDAY = 'Mon',
  TUESDAY = 'Tue',
  WEDNESDAY = 'Wed',
  THURSDAY = 'Thu',
  FRIDAY = 'Fri',
  SATURDAY = 'Sat',
  SUNDAY = 'Sun',
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
  style_properties?: Record<string, string>[];
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

export type GetCellStyleParamsType = {
  node?: MapAny;
  level?: number;
  childIndex?: number;
  column?: MapAny;
  value?: string | number;
  rowParentFieldGreaterByOne?: string | null;
  rowGroupField?: string | null;
  columnId?: string;
  columnGroupId?: string;
  cellType: DISPLAY_CONFIG_CELL_TYPE;
  setAllPivotColumnsToHide?: React.Dispatch<React.SetStateAction<AllPivotColumnsToHideType[]>>;
  currentWidgetInstanceId?: string;
  displayConfigStyle?: Partial<Record<DISPLAY_CONFIG_CELL_TYPE, { rules: MapAny[] }>>;
  colGroupDef?: MapAny;
  colGroupHeaderName?: string;
};

export type CheckPeriodColumnOptionsPropsType = {
  period: DisplayConfigRulesConditionsPeriodType;
  colGroupHeaderName?: string;
  headerName?: string;
  date?: string;
};

export type ColVisibilityConfigType = {
  colId?: string;
  hide?: boolean;
};

export enum DisplayConfigToggleType {
  HIDE_WEEKENDS = 'hide_weekends',
  SHOW_HISTORICAL_FORECAST = 'show_historical_forecast',
}
