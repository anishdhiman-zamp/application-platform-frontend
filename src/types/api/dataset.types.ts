import { MapAny } from "types/commonTypes";
import { CUSTOM_COLUMNS_TYPE } from "components/common/table/table.types";
import { FILTER_TYPES } from "components/filter/filter.types";

export type DatasetFilterConfigResponseType = {
    column: string;
    type: FILTER_TYPES;
    options: string[];
    metadata?: {
        is_hidden?: boolean;
        custom_type?: CUSTOM_COLUMNS_TYPE;
        format?: string;
        currency_column_prefix?: string;
    }
}


export type DatasetDataResponseType = {
    rows: MapAny[];
    columns: MapAny[];
    config: {
        isDrilldownEnabled: boolean;
    };
    totalCount: number;
}

export type DatasetDataRequestType = {
    datasetId: string;
    queryConfig?: string;
}

export type DatasetDrilldownRequestType = {
    datasetId: string;
    rowId: string;
}

export type DatasetDrilldownResponseType = {
    tabs: {
        dataset_id: string;
        datasetData: {
            rows: MapAny[];
            columns: MapAny[];
            totalCount: number;
            config: {
                isDrilldownEnabled: boolean;
            }
            }
    }[]
}

export type DatasetType = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    organization_id: string;
    metadata: MapAny;
};

export type DatasetListingResponseType = {
    datasets: DatasetType[];
    total_count: number;
}

export type DatasetListingRequestType = {
    page: number;
    pageSize: number;
}
