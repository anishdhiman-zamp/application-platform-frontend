import React, { FC, useMemo } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import KpiTag from 'modules/widgets/KpiTag';
import { WIDGET_TYPES } from 'modules/widgets/widgets.constant';
import { getCurrentPageFilters } from 'modules/widgets/widgets.utils';
import { useRouter } from 'next/router';
import { WidgetInstanceType } from 'types/api/pagesApi.types';
import { MapAny } from 'types/commonTypes';
import { isValidDate } from 'utils/common';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceType;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({ widgetDetails }) => {
  const router = useRouter();
  const { widget_type } = widgetDetails;
  const {
    state: { selectedFilters, filtersConfig, isFilterInitialized },
  } = useFiltersContextStore();

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
      `${ROUTES_PATH.DATASET.replace(':datasetId', datasetId ?? '')}?filters=${JSON.stringify({ ...currentWidgetSelectedFilters, ...onClickFilter })}`,
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
          widgetType={widget_type}
          currentPageFilters={currentPageFilters}
          isFilterInitialized={isFilterInitialized}
          onNodeClick={onNodeClick}
        />
      );
    case WIDGET_TYPES.KPI: {
      return (
        <KpiTag
          widgetDetails={widgetDetails}
          isFilterInitialized={isFilterInitialized}
          currentPageFilters={currentPageFilters}
        />
      );
    }
    default:
      return null;
  }
};

export default WidgetsWrapper;
