import React, { FC, } from "react";
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import { WIDGET_TYPES } from 'modules/widgets/widgets.constant';
import { WidgetInstanceType } from "types/api/pagesApi.types";

interface WidgetsWrapperProps {
    widgetDetails: WidgetInstanceType;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({ widgetDetails }) => {
    const { widget_type } = widgetDetails


    switch (widget_type) {
        case WIDGET_TYPES.BAR_CHART:
        case WIDGET_TYPES.LINE_CHART:
        case WIDGET_TYPES.PIE_CHART:
            return <AGChartsWidgets widgetDetails={widgetDetails} widgetType={widget_type} />;
        default:
            return null;
    }

};

export default WidgetsWrapper;