import { WIDGET_TYPES, WidgetDataValueType } from 'modules/widgets/widgets.constant';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export type PageResponseType = {
  page_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  fractional_index: number;
  organization_id: string;
};

export type SheetResponseType = {
  page_id: string;
  name: string;
  description: string;
  sheets: {
    sheet_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    fractional_index: number;
    page_id: string;
  }[];
  created_at: string;
  updated_at: string;
  fractional_index: number;
  organization_id: string;
};

export interface WidgetInstanceType {
  widget_instance_id: string;
  widget_id: string;
  sheet_id: string;
  title: string;
  dataset_id: string;
  data_mappings: DataMappings;
  created_at: string;
  updated_at: string;
  widget_type: WIDGET_TYPES;
}

export interface DataMappings {
  version: string;
  datasets: { id: string }[];
  mappings: MappingsType[];
}

export interface MappingsType {
  dataset_id: string;
  fields: {
    x_axis: AxisMappingType[];
    y_axis: AxisMappingType[];
    slices?: AxisMappingType[];
    values?: AxisMappingType[];
    primary_value: AxisMappingType[];
  };
}

export interface AxisMappingType {
  type: string;
  column: string;
  field_type: 'dimension' | 'measure';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface SheetDetailsResponseType {
  sheet_id: string;
  name: string;
  description: string;
  widget_instances: WidgetInstanceType[];
  sheet_config: SheetConfigType;
  created_at: string;
  updated_at: string;
  fractional_index: number;
  page_id: string;
}

export interface SheetConfigType {
  version: string;
  sheet_layout: Record<
    string,
    {
      x: number;
      y: number;
      w: number;
      h: number;
    }
  >;
}

export type SheetDetailsRequestType = {
  sheetId: string;
  pageId?: string;
};

export type SheetFilterConfigResponseType = {
  native_filter_config: SheetFilterType[];
};

export type SheetFilterType = {
  name: string; // Name of the filter
  filter_type: FILTER_TYPES; // Type of filter
  data_type: WidgetDataValueType; // Data type of the filter
  widgets_in_scope: string[]; // List of widgets affected by this filter
  targets: Target[]; // List of dataset targets for this filter
  default_value?: FilterDefaultValueType; // Default value for the filter
  options?: string[]; // Options for multi-select filters (if applicable)
};

interface Target {
  dataset_id: string; // Unique identifier for the dataset
  column: string; // Column name in the dataset
}

export interface FilterDefaultValueType {
  operator: CONDITION_OPERATOR_TYPE; // Operator for range-based filters
  values: string[];
  from: number | string; // Start value or single value
  to?: number | string; // End value (if applicable)
}

export type AudiencesByPageIdRequest = {
  pageId: string;
};

export type AudiencesByPageIdResponse = {
  resource_audience_type: string;
  resource_audience_id: string;
  privilege: string;
  resource_type: string;
  resource_id: string;
};

export type AudiencesPageShareData = {
  audiences: {
    audience_type: string;
    audience_id: string;
    role: string;
  }[];
};

export type PostPagesToAudiencesByPageIdType = { pageId: string; body: AudiencesPageShareData };
export type PatchChangeAudienceRoleInPageType = { pageId: string; body: { audience_id: string; role: string } };
export type DeleteAudienceFromPageAccessType = { pageId: string; body: { audience_id: string } };
