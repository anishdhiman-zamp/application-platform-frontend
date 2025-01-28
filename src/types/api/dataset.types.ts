import { Session } from 'inspector/promises';
import { DATASET_ACTION_STATUS } from 'modules/data/data.types';
import { MapAny } from 'types/commonTypes';
import { FilterModelType } from 'types/components/table.type';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { FILTER_TYPES } from 'components/filter/filter.types';

export type DatasetFilterConfigResponseType = {
  column: string;
  type: FILTER_TYPES;
  options: string[];
  datatype: string;
  metadata?: {
    is_hidden?: boolean;
    custom_type?: CUSTOM_COLUMNS_TYPE;
    format?: string;
    currency_column_prefix?: string;
    is_editable?: boolean;
  };
};

export type DatasetDataResponseType = {
  rows: MapAny[];
  columns: MapAny[];
  config: {
    is_drilldown_enabled: boolean;
  };
  total_count: number;
};

export type DatasetDataRequestType = {
  datasetId: string;
  query_config?: string;
};

export type DatasetDrilldownRequestType = {
  datasetId: string;
  rowId: string;
};

export type DatasetDrilldownResponseType = {
  tabs: {
    dataset_id: string;
    dataset_data: DatasetDataResponseType;
  }[];
};

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
};

export type DatasetListingRequestType = {
  page: number;
  pageSize: number;
};

export type DatasetUpdateRequestType = {
  datasetId: string;
  data: {
    filters: FilterModelType;
    update: {
      column: string;
      value: string;
    };
  };
  saveAsRule?: boolean;
  ruleTitle?: string;
  ruleDescription?: string;
};

export type DatasetUpdateResponseType = {
  action_id: string;
  action_type: string;
  dataset_id: string;
  status: string;
  config: MapAny;
  action_by: string;
  is_completed: boolean;
};

export type DatasetActionStatusRequestType = {
  datasetId: string;
  params: {
    action_ids?: string[];
    status?: DATASET_ACTION_STATUS;
  };
};

export type DatasetActionStatusResponseType = {
  action_id: string;
  action_type: string;
  dataset_id: string;
  status: DATASET_ACTION_STATUS;
  is_completed: boolean;
  config: MapAny;
  action_by: string;
};

export type AudiencesByDatasetIdRequestType = {
  datasetId: string;
};

export type AudiencesByDatasetIdResponseType = {
  user: Session;
  privilege: string;
  resource_audience_type: string;
  resource_audience_id: string;
  resource_type: string;
};

export type AudiencesDatasetShareData = {
  audiences: {
    audience_type: string;
    audience_id: string;
    role: string;
  }[];
};
