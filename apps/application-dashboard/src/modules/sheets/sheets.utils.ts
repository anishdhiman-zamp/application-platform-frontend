import { PERIODICITY_TYPES } from '@zamp-platform/utils';
import { getWidgetLayout } from 'modules/widgets/create/utils';
import { WidgetSize } from 'modules/widgets/widget.types';
import {
  FilterDefaultValueType,
  LayoutType,
  SheetDetailsResponseType,
  SheetFilterType,
} from 'types/api/pagesApi.types';
import { MapAny, ResponsiveGridLayoutType } from 'types/commonTypes';
import { checkIsObjectEmpty, getPastDateByNumberOfDays } from 'utils/common';
import { WIDGET_TYPES } from '@/types/api/widgets.types';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export const getFormattedSheetsFiltersConfig = (filter: SheetFilterType) => {
  return {
    key: filter?.id,
    label: filter?.name,
    values: filter?.options,
    datatype: filter?.data_type,
    type: filter?.filter_type,
    targets: filter?.targets,
    widgetsInScope: filter?.widgets_in_scope,
  };
};

const getFilterOperator = (operator: CONDITION_OPERATOR_TYPE) => {
  switch (operator) {
    case CONDITION_OPERATOR_TYPE.EQUAL:
      return CONDITION_OPERATOR_TYPE.IN;
    case CONDITION_OPERATOR_TYPE.NOT_EQUAL:
      return CONDITION_OPERATOR_TYPE.NOT_IN;
    default:
      return operator;
  }
};

export const getFilterDefaultValue = (filter: FilterDefaultValueType, filterType: FILTER_TYPES) => {
  switch (filterType) {
    case FILTER_TYPES.SEARCH:
      return {
        filterType: filterType,
        type: filter.operator,
        filter: filter?.value?.[0],
      };
    case FILTER_TYPES.AMOUNT_RANGE:
      return {
        filterType: filterType,
        type: filter.operator,
        filter: filter?.value?.[0],
        filterTo: filter?.value?.[1],
      };
    case FILTER_TYPES.DATE_RANGE:
      return {
        filterType: filterType,
        dateFrom: filter?.value?.[0] ?? getPastDateByNumberOfDays(30).toISOString(),
        dateTo: filter?.value?.[1] ?? getPastDateByNumberOfDays(0).toISOString(),
        periodicity: PERIODICITY_TYPES.DAILY,
        type: filter?.operator,
      };
    case FILTER_TYPES.MULTI_SELECT:
    case FILTER_TYPES.TAGS:
      return {
        filterType: filterType,
        type: getFilterOperator(filter?.operator),
        values: filter?.value,
      };
    case FILTER_TYPES.SINGLE_SELECT:
      return {
        filterType: filterType,
        type: filter?.operator,
        values: filter?.value,
      };
  }
};

export const getDefaultFilterValues = (filters: SheetFilterType[]) => {
  const defaultFilters: MapAny = {};

  filters.forEach((filter) => {
    if (filter?.default_value && !checkIsObjectEmpty(filter?.default_value) && filter?.id) {
      defaultFilters[filter.id] = getFilterDefaultValue(filter?.default_value, filter?.filter_type);
    } else if (filter?.filter_type === FILTER_TYPES.DATE_RANGE && filter?.id) {
      defaultFilters[filter.id] = getFilterDefaultValue(
        { value: [], operator: CONDITION_OPERATOR_TYPE.IN_BETWEEN },
        filter?.filter_type,
      );
    }
  });

  return defaultFilters;
};

/**
 * Finds the last widget layout in the sheet layout
 * @param sheetLayout - The sheet layout to find the last widget layout in
 * @returns The last widget layout
 */
export const getLastWidgetLayout = (
  sheetLayout?: {
    h: number;
    x: number;
    y: number;
    w: number;
    i: string;
  }[],
) => {
  let lastWidgetLayout: LayoutType = { x: 0, y: 0, h: 0, w: 0 };

  if (!sheetLayout?.length) {
    return lastWidgetLayout;
  }

  for (const layout of sheetLayout) {
    if (layout.y > lastWidgetLayout.y) {
      lastWidgetLayout = layout;
    } else if (layout.y === lastWidgetLayout.y && layout.x >= lastWidgetLayout.x) {
      lastWidgetLayout = layout;
    }
  }

  return lastWidgetLayout;
};

type GetUpdatedSheetLayoutParams = {
  targetWidgetIndex: number;
  sheetLayout: ResponsiveGridLayoutType[];
  size: WidgetSize;
  sheetDetails: SheetDetailsResponseType;
};

export const getUpdatedSheetLayout = ({
  targetWidgetIndex,
  sheetLayout,
  size,
  sheetDetails,
}: GetUpdatedSheetLayoutParams) => {
  if (!sheetLayout?.length) {
    return { newLayouts: [], widgetsToUpdate: [] };
  }

  const newLayouts: ResponsiveGridLayoutType[] = [];
  const widgetsToUpdate: ResponsiveGridLayoutType[] = [];

  // Handle first widget (index 0)
  if (targetWidgetIndex === 0) {
    const firstLayout = { ...sheetLayout[0], w: size === 'half' ? 8 : 16 };

    newLayouts.push(firstLayout);
    widgetsToUpdate.push(firstLayout);
  } else {
    newLayouts.push(sheetLayout[0]);
  }

  // Process remaining widgets
  for (let i = 1; i < sheetLayout.length; i++) {
    const originalLayout = sheetLayout[i];
    const isTargetWidget = targetWidgetIndex === i;

    // Find widget instance once
    const instance = sheetDetails?.widget_instances?.find((widget) => widget.widget_instance_id === originalLayout.i);

    // Determine widget size
    const widgetSize = isTargetWidget ? size : originalLayout.w === 8 ? 'half' : 'full';

    // Get updated layout
    const updatedLayout = getWidgetLayout({
      lastWidgetLayout: newLayouts[i - 1],
      size: widgetSize,
      visualizationType: instance?.widget_type as WIDGET_TYPES,
    });

    // Check if layout has changed
    const hasLayoutChanged =
      updatedLayout.w !== originalLayout.w ||
      updatedLayout.x !== originalLayout.x ||
      updatedLayout.y !== originalLayout.y;

    if (hasLayoutChanged) {
      const updatedLayoutWithId = { ...updatedLayout, i: originalLayout.i };

      widgetsToUpdate.push(updatedLayoutWithId);
      newLayouts.push(updatedLayoutWithId);
    } else {
      newLayouts.push({ ...updatedLayout, i: originalLayout.i });
    }
  }

  return {
    newLayouts,
    widgetsToUpdate,
  };
};

export const computeSheetLayout = (
  sheetDetails: any,
  widgetDetails: any,
  getHfromWidgetHeight: (height: number) => number,
) => {
  return (
    sheetDetails?.sheet_config?.sheet_layout?.map((widgetConfig: any) => {
      const widgetType = sheetDetails?.widget_instances?.find(
        (widget: any) => widget?.widget_instance_id === widgetConfig?.default_widget,
      )?.widget_type;

      return {
        i: widgetConfig?.default_widget,
        ...widgetConfig?.layout,
        h:
          widgetType === WIDGET_TYPES.PIVOT_TABLE && widgetDetails?.height > 0
            ? Math.min(getHfromWidgetHeight(widgetDetails?.height), widgetConfig?.layout?.h)
            : widgetConfig?.layout?.h,
      };
    }) ?? []
  );
};

export const getDatasetIdAndWidgetsMapping = (sheetDetails?: SheetDetailsResponseType) => {
  const mapping: Record<string, string[]> = {};

  if (!sheetDetails) {
    return mapping;
  }

  const sheetWidgetIds = sheetDetails?.sheet_config?.sheet_layout?.map((widget) => widget.default_widget);

  if (!sheetWidgetIds?.length) {
    return mapping;
  }

  sheetDetails?.widget_instances?.forEach((widget) => {
    if (sheetWidgetIds?.includes(widget?.widget_instance_id)) {
      const datasetId = widget?.data_mappings?.mappings?.[0]?.dataset_id;

      if (datasetId) {
        mapping[datasetId] = [...(mapping[datasetId] || []), widget?.widget_instance_id];
      }
    }
  });

  return mapping;
};
