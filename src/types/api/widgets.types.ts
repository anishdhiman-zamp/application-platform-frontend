import { WIDGET_TYPES } from "modules/widgets/widgets.constant"
import { MapAny } from "types/commonTypes";

export type WidgetMappingType = {
    "x_axis": {
        "field": string,
    },
    "y_axis": [{
        "field": string,
        "aggregation": string,
    }]
}

export type WidgetDataMappingsType = {
    datasets: {
        id: string;
    }[];
    mappings: WidgetMappingType;
    group_by: string[];
}

export type WidgetInstanceResponseType = {
    "instance_id": string,
    "widget_id": number,
    "type": WIDGET_TYPES,
    "title": string,
    "data_mappings": WidgetDataMappingsType,
    "visual_config": MapAny
}

export type WidgetColumnType = {
    "column_name": string,
    "column_type": string,
}

export type WidgetDataRowType = {
    "CurrencyCode": string,
    "SUM(IntegerAmount)": number
}

export type WidgetDataType = {
    "status": string,
    "error": MapAny,
    "rowcount": number,
    "columns": WidgetColumnType[],
    "data": WidgetDataRowType[]
}

export type WidgetDataResponseType = {
    "result": WidgetDataType[]
}

export type WidgetDataRequestType = {
    widgetId: string;
}