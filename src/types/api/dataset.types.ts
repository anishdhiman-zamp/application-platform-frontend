import { MapAny } from "types/commonTypes";
import { FILTER_TYPES } from "components/filter/filter.types";

export type DatasetFilterConfigResponseType = {
    column: string;
    type: FILTER_TYPES;
    options: string[];
}


export type DatasetDataResponseType = {
    rows: MapAny[];
    columns: MapAny[];
}

export type DatasetDataRequestType = {
    datasetId: string;
    queryConfig?: string;
}