import { ColumnContext, DISPLAY_CONFIG_CELL_TYPE, DISPLAY_CONFIG_RULES } from 'modules/widgets/Pivot/pivot.utils';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export type PivotColumnMetadata =
  | {
      kind: 'group';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      alias: string;
      mappingName: string;
      heirarchy: number;
      hasChildren: boolean;
      maxHeirarchy: number;
    }
  | {
      kind: 'pivot';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      alias: string;
      mappingName: string;
    }
  | {
      kind: 'aggregate';
      name: string;
      dataType: 'string' | 'number' | 'date';
      aggregation: string;
      sourceName: string;
      alias: string;
      mappingName: string;
    };

export enum PIVOT_DATA_TYPES {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  STATUS = 'status',
  TIMESTAMP = 'timestamp',
  COUNTRY = 'country',
  BANK = 'bank',
  TAG = 'tag',
  BOOLEAN = 'boolean',
  AMOUNT = 'amount',
}

export type MappingDetails = {
  column?: string;
  drilldown_filter_type?: string;
  drilldown_filter_operator?: string;
};

export type ParentMappingDetail = {
  key: string;
  tag: boolean;
  mappingDetails: MappingDetails | null;
};

export enum UNTAGGED_TAGS {
  UNTAGGED = '__UNTAGGED__',
}

export enum UNTAGGED_TAGS_FRONTEND_MAPPING {
  UNTAGGED = 'Untagged',
}

export type FilterConfig = {
  filterType?: string;
  type?: string;
  values?: string[];
  dateFrom?: string;
  dateTo?: string;
  column?: string;
  targets?: string[];
};

export type ParentFilters = Record<string, FilterConfig>;

export type PivotContext = {
  filterContext: Record<string, ColumnFilterConfig[]>;
  widgetMappingDatasets: Record<string, string>;
  columnContextMapping: Record<string, Record<string, ColumnContext>>;
};

export type ColumnFilterConfig = {
  column: string;
} & (
  | {
      filterType: FILTER_TYPES.MULTI_SELECT;
      type: CONDITION_OPERATOR_TYPE.IN;
    }
  | {
      filterType: FILTER_TYPES.DATE_RANGE;
      type: CONDITION_OPERATOR_TYPE.IN_BETWEEN;
    }
  | {
      filterType: FILTER_TYPES.SEARCH;
      type: CONDITION_OPERATOR_TYPE.STARTS_WITH;
    }
);

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

export type DisplayConfigRulesConditionsType = {
  level?: number;
  alternate_cell_number?: number;
  ref?: string;
  column_id?: string[];
  column_group_id?: string;
  row_group_field?: string;
  operator?: string;
  header_name?: string;
  period?: string;
  alias?:
    | DisplayConfigRulesConditionsAliasType.STRING
    | DisplayConfigRulesConditionsAliasType.NUMBER
    | DisplayConfigRulesConditionsAliasType.DATE;
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

export type ColumnsToHideType = {
  colId?: string;
  hide?: boolean;
};

export type AllPivotColumnsToHideType = {
  widgetInstanceId?: string;
  colIds?: ColumnsToHideType[];
};
