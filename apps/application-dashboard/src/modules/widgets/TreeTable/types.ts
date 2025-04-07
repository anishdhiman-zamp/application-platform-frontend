import { PERIODICITY_TYPES } from 'constants/date.constants';
import { ParentFilters } from 'modules/widgets/Pivot/pivot.types';
import { WIDGET_TYPES, WidgetDataResponseType, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';

export interface TreeTableComponentInterface {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
  periodicity: PERIODICITY_TYPES;
  timeColumns: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  isFilterLoading?: boolean;
  currency: string;
  currentWidgetSelectedFilter: MapAny;
  activeWidget: string;
  handleWidgetHeightChange: (height: number, isSingleHeader: boolean) => void;
  defaultCurrency: string;
}

export interface TableInterface {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  widgetData: WidgetDataResponseType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  currentWidgetSelectedFilter: ParentFilters;
  periodicity: PERIODICITY_TYPES;
  activeWidget: string;
  handleWidgetHeightChange: (height: number, isSingleHeader: boolean) => void;
  defaultCurrency: string;
}
