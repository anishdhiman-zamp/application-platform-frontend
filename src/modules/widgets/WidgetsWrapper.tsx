import React, { FC, } from "react";
import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import { WidgetInstanceType } from "types/api/pagesApi.types";

interface WidgetsWrapperProps {
    widgetDetails: WidgetInstanceType;
}

const WidgetsWrapper: FC<WidgetsWrapperProps> = ({ widgetDetails }) => {

    return <AGChartsWidgets widgetDetails={widgetDetails} />;
};

export default WidgetsWrapper;
