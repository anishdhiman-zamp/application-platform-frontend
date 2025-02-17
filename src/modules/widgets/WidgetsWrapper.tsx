import { FC, useMemo } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import KpiTag from 'modules/widgets/KpiTag';
import PivotTableWidgetWrapper from 'modules/widgets/Pivot/components/PivotWidgetWrapper';
import { getCurrentPageFilters, getDateRangeWithPeriodicity } from 'modules/widgets/widgets.utils';
import { useRouter } from 'next/router';
import { FieldsMappingType, WIDGET_TYPES, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import { isValidDate } from 'utils/common';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({ widgetDetails, groupWidgetsOptions, onWidgetChange }) => {
  const router = useRouter();
  const { widget_type } = widgetDetails;
  const { fields } = widgetDetails?.data_mappings?.mappings?.[0] ?? {};

  const { filterType, filterOperator } = useMemo(() => {
    if (widget_type === WIDGET_TYPES.BAR_CHART || widget_type === WIDGET_TYPES.LINE_CHART) {
      return {
        filterType: (fields as FieldsMappingType)?.x_axis?.[0]?.drilldown_filter_type,
        filterOperator: (fields as FieldsMappingType)?.x_axis?.[0]?.drilldown_filter_operator,
      };
    }

    if (widget_type === WIDGET_TYPES.PIE_CHART || widget_type === WIDGET_TYPES.DONUT_CHART) {
      return {
        filterType: (fields as { slices: { drilldown_filter_type: string }[] })?.slices?.[0]?.drilldown_filter_type,
        filterOperator: (fields as { slices: { drilldown_filter_operator: string }[] })?.slices?.[0]
          ?.drilldown_filter_operator,
      };
    }

    return { filterType: undefined, operator: undefined };
  }, [fields, widget_type]);

  const {
    state: { selectedFilters, filtersConfig, isFilterInitialized },
  } = useFiltersContextStore();

  const periodicity = useMemo(() => {
    if (!selectedFilters) return {};

    for (const key in selectedFilters) {
      if (selectedFilters[key] && typeof selectedFilters[key] === 'object' && 'periodicity' in selectedFilters[key]) {
        return {
          timeColumn: key,
          periodicity: selectedFilters[key]?.periodicity,
        };
      }
    }

    return {};
  }, [selectedFilters]);

  const { currentPageFiltersConfig, currentWidgetSelectedFilters } = useMemo(() => {
    const currentWidgetSelectedFilters: MapAny = {};
    const currentPageFiltersConfig = filtersConfig?.filter((filter) =>
      filter?.widgetsInScope?.includes(widgetDetails?.widget_instance_id),
    );

    currentPageFiltersConfig?.forEach((filter) => {
      if (
        selectedFilters[filter?.key]?.values?.length ||
        selectedFilters[filter?.key]?.dateTo ||
        selectedFilters[filter?.key]?.filter
      ) {
        currentWidgetSelectedFilters[filter?.key] = selectedFilters[filter?.key];
      }
    });

    return { currentPageFiltersConfig, currentWidgetSelectedFilters };
  }, [filtersConfig, selectedFilters, widgetDetails]);

  const currentPageFilters = useMemo(() => {
    const datasetFilters = getCurrentPageFilters(currentPageFiltersConfig ?? [], selectedFilters);

    return JSON.stringify(datasetFilters.length > 0 ? datasetFilters : []);
  }, [currentPageFiltersConfig, selectedFilters]);

  const onNodeClick = (clickedNode: MapAny, xAxis: string) => {
    const datasetId = widgetDetails?.data_mappings?.mappings?.[0]?.dataset_id;
    const clickFilter: MapAny = {};

    if (filterType === FILTER_TYPES.DATE_RANGE) {
      if (currentWidgetSelectedFilters[xAxis]?.dateFrom && currentWidgetSelectedFilters[xAxis]?.dateTo) {
        const [dateFrom, dateTo] = getDateRangeWithPeriodicity(
          periodicity.periodicity,
          clickedNode[xAxis],
          currentWidgetSelectedFilters[xAxis]?.dateFrom,
          currentWidgetSelectedFilters[xAxis]?.dateTo,
        );

        clickFilter[xAxis] = {
          filterType: FILTER_TYPES.DATE_RANGE,
          type: filterOperator,
          values: [dateFrom, dateTo],
        };
      }
    } else if (filterType === FILTER_TYPES.MULTI_SELECT) {
      clickFilter[xAxis] = {
        filterType: FILTER_TYPES.MULTI_SELECT,
        type: filterOperator,
        values: [clickedNode[xAxis]],
      };
    }

    const isDate = isValidDate(clickedNode[xAxis]);

    //TODO:Update logic for filter type
    const onClickFilter = isDate
      ? {
          [xAxis]: {
            dateFrom: clickedNode[xAxis],
            dateTo: clickedNode[xAxis],
            filterType: FILTER_TYPES.DATE_RANGE,
            type: CONDITION_OPERATOR_TYPE.IN_BETWEEN,
          },
        }
      : {
          [xAxis]: {
            filterType: FILTER_TYPES.MULTI_SELECT,
            type: CONDITION_OPERATOR_TYPE.CONTAINS,
            values: [clickedNode[xAxis]],
          },
        };

    router.push(
      `${ROUTES_PATH.DATASET.replace(':datasetId', datasetId ?? '')}?filters=${JSON.stringify({ ...currentWidgetSelectedFilters, ...onClickFilter, ...clickFilter })}`,
    );
  };

  switch (widget_type) {
    case WIDGET_TYPES.BAR_CHART:
    case WIDGET_TYPES.LINE_CHART:
    case WIDGET_TYPES.PIE_CHART:
    case WIDGET_TYPES.DONUT_CHART:
      return (
        <AGChartsWidgets
          widgetDetails={widgetDetails}
          currentPageFilters={currentPageFilters}
          isFilterInitialized={isFilterInitialized}
          onNodeClick={onNodeClick}
          periodicity={periodicity.periodicity}
          timeColumn={periodicity.timeColumn ?? ''}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
        />
      );
    case WIDGET_TYPES.KPI: {
      return (
        <KpiTag
          widgetDetails={widgetDetails}
          isFilterInitialized={isFilterInitialized}
          currentPageFilters={currentPageFilters}
          periodicity={periodicity?.periodicity}
          timeColumn={periodicity?.timeColumn ?? ''}
        />
      );
    }
    case WIDGET_TYPES.PIVOT_TABLE: {
      return (
        <PivotTableWidgetWrapper
          widgetInstanceDetails={widgetDetails}
          isFilterInitialized={isFilterInitialized}
          currentPageFilters={currentPageFilters}
          periodicity={periodicity.periodicity}
          timeColumn={periodicity.timeColumn ?? ''}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
        />
      );
    }
    default:
      return null;
  }
};

export default WidgetsWrapper;
