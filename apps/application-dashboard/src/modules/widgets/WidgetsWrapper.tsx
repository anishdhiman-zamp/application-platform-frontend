import { FC, useMemo } from 'react';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { getDatasetRouteById, getPageDatasetRoute, getPageDrilldownMultiRoute } from 'constants/routeConfig';
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import KpiTag from 'modules/widgets/KpiTag';
import PivotTableWidgetWrapper from 'modules/widgets/Pivot/components/PivotWidgetWrapper';
import { DRILLDOWN_VERSION_V2 } from 'modules/widgets/Pivot/pivot.constants';
import type { ParentFilters } from 'modules/widgets/Pivot/pivot.types';
import {
  getCurrentPageFilters,
  getDateRangeWithPeriodicity,
  getDefaultFilterByDatasetId,
  getDefaultFilters,
  mergeFilters,
  transformFilterKeys,
} from 'modules/widgets/widgets.utils';
import { useParams, useRouter } from 'next/navigation';
import {
  type DrillDownConfigType,
  FieldsMappingType,
  PieDonutChartFieldsMappingType,
  WIDGET_TYPES,
  WidgetInstanceType,
} from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface WidgetsWrapperProps {
  widgetDetails: WidgetInstanceType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  currency: string[];
  activeWidget: string;
  defaultCurrency: string;
  handleWidgetHeightChange: (height: number, isSingleHeader: boolean) => void;
  sheetId: string;
  setActiveWidget?: (widgetId: string) => void;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({
  widgetDetails,
  groupWidgetsOptions,
  onWidgetChange,
  currency,
  activeWidget,
  setActiveWidget,
  defaultCurrency,
  handleWidgetHeightChange,
  sheetId,
}) => {
  const router = useRouter();
  const params = useParams();
  const { widget_type } = widgetDetails;
  const { fields } = widgetDetails?.data_mappings?.mappings?.[0] ?? {};
  const { version } = widgetDetails?.data_mappings ?? {};
  const {
    state: { selectedFilters, filtersConfig, isFilterInitialized, isFilterLoading },
  } = useFiltersContextStore();

  // to be remove

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

  const periodicity = useMemo(() => {
    if (!selectedFilters) return {};

    for (const key in selectedFilters) {
      if (selectedFilters[key] && typeof selectedFilters[key] === 'object' && 'periodicity' in selectedFilters[key]) {
        const filter = filtersConfig?.find((filter) => filter?.key === key);

        if (filter)
          return {
            timeColumn: JSON.stringify(filter?.targets),
            periodicity: selectedFilters[key]?.periodicity,
          };
      }
    }

    return {};
  }, [selectedFilters, filtersConfig]);

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
        currentWidgetSelectedFilters[filter?.key] = {
          ...selectedFilters[filter?.key],
          targets: filtersConfig?.find((f) => f?.key === filter?.key)?.targets,
        };
      }
    });

    return { currentPageFiltersConfig, currentWidgetSelectedFilters };
  }, [filtersConfig, selectedFilters, widgetDetails]);

  const currentPageFilters = useMemo(() => {
    const datasetFilters = getCurrentPageFilters(currentPageFiltersConfig ?? [], selectedFilters);

    return JSON.stringify(datasetFilters?.length > 0 ? datasetFilters : []);
  }, [currentPageFiltersConfig, selectedFilters]);

  const navigateToDatasetV2 = (datasets: { dataset_id: string; dataset_name: string }[], filters: ParentFilters) => {
    if (datasets?.length > 0) {
      const path = getPageDrilldownMultiRoute(
        params?.pageId as string,
        datasets?.map((dataset) => dataset?.dataset_id),
      );

      const encodedFilters = encodeURIComponent(JSON.stringify(filters));

      router.push(`${path}?datasets=${encodedFilters}`);
    }
  };

  const onNodeClickV2 = (
    clickedNode: MapAny,
    xAxis: string,
    datasetId: string,
    datasetDefaultFilters: string,
    drilldown_config?: DrillDownConfigType,
    fields?: FieldsMappingType | PieDonutChartFieldsMappingType,
  ) => {
    const xAxisColumnName =
      (fields as FieldsMappingType)?.x_axis?.[0]?.column ??
      (fields as PieDonutChartFieldsMappingType).values?.[0]?.column;

    const yAxisColumnName =
      (fields as FieldsMappingType)?.y_axis?.[0]?.alias ??
      (fields as PieDonutChartFieldsMappingType).values?.[0]?.alias;

    const datasets = drilldown_config?.measure_drilldowns?.[yAxisColumnName as string];
    const columnFilters = drilldown_config?.column_mappings;

    if (!datasets || !Array.isArray(datasets) || !columnFilters) return;

    const clickFilter: ParentFilters = {};

    datasets?.forEach((dataset) => {
      if (!dataset?.dataset_id) return;
      const currentDatasetFilters = columnFilters?.[dataset?.dataset_id];

      const type = currentDatasetFilters?.[xAxisColumnName]?.filter_type;
      const operator = currentDatasetFilters?.[xAxisColumnName]?.filter_operator;

      const defaultFilters = getDefaultFilters({
        defaultWidgetFilters: datasetDefaultFilters,
        datasetFilters: currentDatasetFilters,
      });

      const datasetClickFilter: ParentFilters = {};

      if (type === FILTER_TYPES.DATE_RANGE) {
        const [dateFrom, dateTo] = getDateRangeWithPeriodicity(
          periodicity.periodicity,
          clickedNode[xAxis],
          currentWidgetSelectedFilters[xAxis]?.dateFrom ?? '',
          currentWidgetSelectedFilters[xAxis]?.dateTo ?? '',
        );

        datasetClickFilter[xAxisColumnName] = {
          filterType: FILTER_TYPES.DATE_RANGE,
          type: operator,
          dateFrom,
          dateTo,
        };
      } else {
        datasetClickFilter[xAxisColumnName] = {
          filterType: type,
          type: operator,
          values: [clickedNode[xAxis]],
        };
      }

      const mergedFilters = mergeFilters(defaultFilters, currentWidgetSelectedFilters);

      const transformedClickFilter = transformFilterKeys(
        {
          ...mergedFilters,
          ...datasetClickFilter,
        },
        currentDatasetFilters,
      );

      clickFilter[dataset?.dataset_id] = {
        filters: transformedClickFilter,
        title: dataset?.dataset_name,
      };
    });

    navigateToDatasetV2(datasets, clickFilter);
  };

  const onNodeClick = (clickedNode: MapAny, xAxis: string, datasetId: string, datasetDefaultFilters: string) => {
    const xAxisColumnName =
      (fields as FieldsMappingType)?.x_axis?.[0]?.column ??
      (fields as PieDonutChartFieldsMappingType).values?.[0]?.column;

    const clickFilter: MapAny = {};

    const defaultFilters = getDefaultFilterByDatasetId({
      mappings: widgetDetails?.data_mappings?.mappings,
      defaultWidgetFilters: datasetDefaultFilters,
    });

    if (filterType === FILTER_TYPES.DATE_RANGE) {
      const [dateFrom, dateTo] = getDateRangeWithPeriodicity(
        periodicity.periodicity,
        clickedNode[xAxis],
        currentWidgetSelectedFilters[xAxis]?.dateFrom ?? '',
        currentWidgetSelectedFilters[xAxis]?.dateTo ?? '',
      );

      clickFilter[xAxisColumnName] = {
        filterType: FILTER_TYPES.DATE_RANGE,
        type: filterOperator,
        dateFrom,
        dateTo,
      };
    } else if (filterType === FILTER_TYPES.MULTI_SELECT) {
      clickFilter[xAxisColumnName] = {
        filterType: FILTER_TYPES.MULTI_SELECT,
        type: filterOperator,
        values: [clickedNode[xAxis]],
      };
    }

    let path = getDatasetRouteById(datasetId);

    if (params?.pageId) {
      path = getPageDatasetRoute(params?.pageId as string, datasetId);
    }

    router.push(
      `${path}?filters=${JSON.stringify({
        ...mergeFilters(currentWidgetSelectedFilters, defaultFilters),
        ...clickFilter,
      })}&currency=${currency}`,
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
          onNodeClick={version === DRILLDOWN_VERSION_V2 ? onNodeClickV2 : onNodeClick}
          periodicity={periodicity.periodicity ?? PERIODICITY_TYPES.DAILY}
          timeColumns={periodicity.timeColumn ?? ''}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          activeWidget={activeWidget}
          isFilterLoading={isFilterLoading}
          currency={currency?.[0] ?? undefined}
          defaultCurrency={defaultCurrency}
        />
      );
    case WIDGET_TYPES.KPI: {
      return (
        <KpiTag
          widgetDetails={widgetDetails}
          isFilterInitialized={isFilterInitialized}
          currentPageFilters={currentPageFilters}
          periodicity={periodicity?.periodicity ?? PERIODICITY_TYPES.DAILY}
          timeColumns={periodicity?.timeColumn ?? ''}
          isFilterLoading={isFilterLoading}
          currency={currency?.[0]}
          defaultCurrency={defaultCurrency}
        />
      );
    }
    case WIDGET_TYPES.PIVOT_TABLE: {
      return (
        <PivotTableWidgetWrapper
          widgetInstanceDetails={widgetDetails}
          isFilterInitialized={isFilterInitialized}
          currentPageFilters={currentPageFilters}
          currentWidgetSelectedFilter={currentWidgetSelectedFilters}
          periodicity={periodicity.periodicity ?? PERIODICITY_TYPES.DAILY}
          timeColumns={periodicity.timeColumn ?? ''}
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          activeWidget={activeWidget}
          setActiveWidget={setActiveWidget}
          isFilterLoading={isFilterLoading}
          currency={currency?.[0]}
          defaultCurrency={defaultCurrency}
          handleWidgetHeightChange={handleWidgetHeightChange}
          sheetId={sheetId}
        />
      );
    }
    default:
      return null;
  }
};

export default WidgetsWrapper;
