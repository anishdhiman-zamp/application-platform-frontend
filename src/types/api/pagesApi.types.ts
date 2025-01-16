export type PageResponseType = {
    page_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    fractional_index: number;
    organization_id: string;
}

export type SheetResponseType = {
    page_id: string;
    name: string;
    description: string;
    sheets: {
        sheet_id: string;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
        fractional_index: number;
        page_id: string;
    }[];
    created_at: string;
    updated_at: string;
    fractional_index: number;
    organization_id: string;
}

export interface WidgetInstanceType {
    widget_instance_id: string;
    widget_id: string;
    sheet_id: string;
    title: string;
    dataset_id: string;
    data_mappings: DataMappings;
    created_at: string;
    updated_at: string;
}

export interface DataMappings {
    version: string;
    datasets: { id: string }[];
    mappings: MappingsType;
}

export interface MappingsType {
    x_axis?: AxisMappingType;
    y_axis?: AxisMappingType;
    slices?: AxisMappingType;
    values?: AxisMappingType;
}

export interface AxisMappingType {
    type: string;
    column: string;
    field_type: "dimension" | "measure";
    aggregation?: "sum" | "avg" | "count" | "min" | "max";
}

export interface SheetDetailsResponseType {
    sheet_id: string;
    name: string;
    description: string;
    widget_instances: WidgetInstanceType[];
    created_at: string;
    updated_at: string;
    fractional_index: number;
    page_id: string;
}

export type SheetDetailsRequestType = {
    pageId: string;
    sheetId: string;
}