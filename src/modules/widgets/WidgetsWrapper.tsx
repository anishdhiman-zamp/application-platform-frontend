import React, { FC, useMemo, } from "react";
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import AGPieChartsWidgets from 'modules/widgets/AGPieChartsWidgets';
import { WIDGET_TYPES } from 'modules/widgets/widgets.constant';
import { getCurrentPageFilters } from 'modules/widgets/widgets.utils';
import { WidgetInstanceType } from "types/api/pagesApi.types";
import { useFiltersContextStore } from "components/filter/filters.context";

interface WidgetsWrapperProps {
    widgetDetails: WidgetInstanceType;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({ widgetDetails }) => {
    const { widget_type } = widgetDetails
    const { state: { selectedFilters, filtersConfig, isFilterInitialized } } = useFiltersContextStore()
    const currentPageFiltersConfig = useMemo(() => {
        return filtersConfig?.filter((filter) => filter?.widgetsInScope?.includes(widgetDetails?.widget_instance_id))
    }, [filtersConfig, widgetDetails])

    const currentPageFilters = useMemo(() => {
        const datasetFilters = getCurrentPageFilters(currentPageFiltersConfig ?? [], selectedFilters)

        return JSON.stringify(datasetFilters.length > 0 ? datasetFilters : [])
    }, [currentPageFiltersConfig, selectedFilters])

    switch (widget_type) {
        case WIDGET_TYPES.BAR_CHART:
        case WIDGET_TYPES.LINE_CHART:
            return <AGChartsWidgets widgetDetails={widgetDetails} widgetType={widget_type} currentPageFilters={currentPageFilters} isFilterInitialized={isFilterInitialized} />;
        case WIDGET_TYPES.PIE_CHART:
            return <AGPieChartsWidgets widgetDetails={widgetDetails} widgetType={widget_type} currentPageFilters={currentPageFilters} isFilterInitialized={isFilterInitialized} />;
        default:
            return null;
    }

};

export default WidgetsWrapper;