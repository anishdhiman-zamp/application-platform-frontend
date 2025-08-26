import { type Dispatch } from 'react';
import { AGGREGATION_TYPES, WIDGET_TYPES, WidgetDataType, WidgetInstanceType } from 'types/api/widgets.types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { ActionType } from '@/components/filter/filters.context';
import { DatasetFilterConfigResponseType } from '@/types/api/dataset.types';
import { LayoutType } from '@/types/api/pagesApi.types';
import { MapAny } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';

export interface WidgetCreationFormData {
  title: string;
  datasetId: string;
  visualizationType: WIDGET_TYPES;
  size: 'half' | 'full';
  chartSpecificFields: ChartSpecificFields;
}

export interface ChartSpecificFields {
  barChart?: BarLineChartFields;
  lineChart?: BarLineChartFields;
  donutChart?: DonutChartFields;
  kpiTag?: KpiTagFields;
}

export interface BarLineChartFields {
  xAxis: {
    column: string;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
  yAxis: {
    column: string;
    aggregation: AGGREGATION_TYPES;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
  groupBy?: {
    column: string;
    stacking: boolean;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
}

export interface DonutChartFields {
  field: {
    column: string;
    aggregation: AGGREGATION_TYPES;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
  groupBy: {
    column: string;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
}

export interface KpiTagFields {
  metricField: {
    column: string;
    aggregation: AGGREGATION_TYPES;
    column_type: string;
    filter_type: FILTER_TYPES;
  };
}

export interface DatasetColumn {
  column_name: string;
  column_type: string;
  alias: string;
  label: string;
  value: string;
  filter_type: FILTER_TYPES;
}

export interface WidgetCreationContextType {
  formData: WidgetCreationFormData;
  setFormData: (data: Partial<WidgetCreationFormData>) => void;
  previewData: WidgetDataType[];
  setPreviewData: (data: WidgetDataType[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  datasetColumns: DatasetColumn[];
  setDatasetColumns: (columns: DatasetColumn[]) => void;
  saveToLocalStorage: () => void;
  clearLocalStorage: () => void;
  mockWidgetDetails?: WidgetInstanceType;
  setMockWidgetDetails: (details: WidgetInstanceType) => void;
  mockData: MapAny[];
  setMockData: (data: MapAny[]) => void;
  editWidgetInstanceId?: string;
  preSelectedFilters?: FilterModelType | null;
}

// Define interface for group statistics
export interface GroupStats {
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

export interface GetWidgetLayoutParams {
  lastWidgetLayout: LayoutType;
  size: 'half' | 'full';
  visualizationType: WIDGET_TYPES;
}

export interface SetupColumnsAndFiltersParams {
  datasetFilterConfigData?: DatasetFilterConfigResponseType[];
  dispatch: Dispatch<ActionType>;
  setDatasetColumns: (columns: DatasetColumn[]) => void;
}

export interface ChartSpecificFormProps {
  handleChartFieldChange: (chartType: string, field: string, value: any) => void;
  formData: WidgetCreationFormData;
  datasetColumns: DatasetColumn[];
}

export interface SetupChartParams {
  formData: WidgetCreationFormData;
  mockData: MapAny[];
  setPreviewData: (data: WidgetDataType[]) => void;
  setMockWidgetDetails: (details: WidgetInstanceType) => void;
  mockWidgetDetailsLocal: WidgetInstanceType;
}
export interface ChartField {
  column?: string;
  column_type?: string;
  aggregation?: AGGREGATION_TYPES;
}

export interface ChartFields {
  xAxis?: ChartField;
  yAxis?: ChartField;
  groupBy?: ChartField;
}
