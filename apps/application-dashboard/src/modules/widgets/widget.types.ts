import { MapAny } from 'types/commonTypes';
import { DrillDownConfigType, FieldsMappingType, PieDonutChartFieldsMappingType } from '@/types/api/widgets.types';

export interface WidgetNodeClickParams {
  clickedNode: MapAny;
  xAxis: string;
  datasetId: string;
  datasetDefaultFilters: string;
  drilldown_config?: DrillDownConfigType;
  fields?: FieldsMappingType | PieDonutChartFieldsMappingType;
  yAxis?: string;
}

export type WidgetSize = 'half' | 'full';
export interface ResizeProps {
  size: WidgetSize;
  onSizeChange: (size: WidgetSize) => void;
}
