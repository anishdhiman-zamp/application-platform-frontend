import { MapAny } from 'types/commonTypes';

export enum WIDGET_TYPES {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  DONUT_CHART = 'donut_chart',
  KPI = 'kpi',
  TABLE = 'table',
  PIVOT_TABLE = 'pivot_table',
}

export type WidgetColumnType = {
  column_name: string;
  column_type: string;
};

export type WidgetDataRowType = {
  CurrencyCode: string;
  'SUM(IntegerAmount)': number;
};

export type WidgetDataType = {
  status: string;
  error: MapAny;
  rowcount: number;
  columns: WidgetColumnType[];
  data: MapAny[];
};

export type WidgetDataResponseType = {
  result: WidgetDataType[];
};

export type WidgetDataRequestType = {
  widgetId: string;
  filters: string;
};

export enum AGGREGATION_TYPES {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
}

export enum FIELD_TYPES {
  DIMENSION = 'dimension',
  MEASURE = 'measure',
}

export type KPITagWidgetMapping = {
  dataset_id: string;
  fields: {
    primary_value: {
      type: string;
      column: string;
      field_type: FIELD_TYPES;
      aggregation?: AGGREGATION_TYPES;
    }[];
  };
};

export type PivotTableWidgetMapping = {
  dataset_id: string;
  name: string;
  fields: {
    columns: {
      column: string;
      type: string;
      field_type: FIELD_TYPES;
    }[];
    rows?: {
      column: string;
      type: string;
      field_type: FIELD_TYPES;
    }[];
    values: {
      column: string;
      aggregation: AGGREGATION_TYPES;
      type: string;
      field_type: FIELD_TYPES;
    }[];
  };
};

export type BarLineChartWidgetMapping = {
  dataset_id: string;
  fields: {
    x_axis: AxisMappingType[];
    y_axis: AxisMappingType[];
    group_by?: AxisMappingType[];
  };
};

export interface PieDonutChartWidgetMapping {
  dataset_id: string;
  fields: {
    slices?: AxisMappingType[];
    values?: AxisMappingType[];
  };
}

export interface AxisMappingType {
  type: string;
  column: string;
  field_type: FIELD_TYPES;
  aggregation?: AGGREGATION_TYPES;
}

export type WidgetInstanceResponseType = WidgetInstanceType;

export type WidgetInstanceBaseType = {
  widget_instance_id: string;
  widget_id: string;
  sheet_id: string;
  title: string;
  dataset_id: string;
  created_at: string;
  updated_at: string;
};

export type LineBarChartWidgetInstanceType = WidgetInstanceBaseType & {
  widget_type: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART;
  data_mappings: {
    version: string;
    datasets: { id: string }[];
    mappings: BarLineChartWidgetMapping[];
  };
};

export type PieDonutChartWidgetInstanceType = WidgetInstanceBaseType & {
  widget_type: WIDGET_TYPES.PIE_CHART | WIDGET_TYPES.DONUT_CHART;
  data_mappings: {
    version: string;
    datasets: { id: string }[];
    mappings: PieDonutChartWidgetMapping[];
  };
};

export type PivotTableWidgetInstanceType = WidgetInstanceBaseType & {
  widget_type: WIDGET_TYPES.PIVOT_TABLE;
  data_mappings: {
    version: string;
    datasets: { id: string }[];
    mappings: PivotTableWidgetMapping[];
  };
};

export type KPITagWidgetInstanceType = WidgetInstanceBaseType & {
  widget_type: WIDGET_TYPES.KPI;
  data_mappings: {
    version: string;
    mappings: KPITagWidgetMapping[];
  };
};

export type WidgetInstanceType =
  | LineBarChartWidgetInstanceType
  | PieDonutChartWidgetInstanceType
  | PivotTableWidgetInstanceType
  | KPITagWidgetInstanceType;
