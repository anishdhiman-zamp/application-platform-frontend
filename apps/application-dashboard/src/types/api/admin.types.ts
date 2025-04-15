import { DatasetType, ProviderType } from 'modules/admin/admin.types';
import { MapAny } from 'types/commonTypes';

export type GetDatasetDisplayConfigRequestType = {
  datasetId: string;
};

export type displayConfigType = {
  column: string;
  is_hidden: string;
  is_editable: string;
  type: string;
  config: {
    amount_column: string;
    currency_column: string;
  };
};

export type GetDatasetDisplayConfigResponseType = {
  display_config: displayConfigType[];
};

export type PostDatasetDisplayConfigRequestType = {
  datasetId: string;
  body: { display_config: displayConfigType[] };
};

export type PostDatasetDisplayConfigResponseType = {
  action_id: string;
};

export type EdgeConfigType = {
  downstream_jobs_source_type?: string;
  downstream_jobs_source_value?: string;
  job_id: number;
  source_dataset_id?: string;
  template_id?: string;
  destination_dataset_id?: string;
  dataplatform_modules_src?: string;
  dataset_id?: string;
};

export type NodeConfigType = {
  NodeId: string;
  NodeType: string;
  EdgeConfig: EdgeConfigType | null;
  Parents: NodeConfigType[] | null;
};

export type GetDatasetDagResponseType = {
  dag: Record<string, NodeConfigType>;
};

export type CreateDatasetRequestType = {
  title: string;
  description: string;
  dedup_columns: string[];
  s3_path: string;
  partition_columns: string[];
  provider: ProviderType;
};

export type CreateDatasetResponseType = {
  action_id: string; // poll this action_id to get the status of the dataset creation
  dataset_id: string;
  register_dataset_action_id: string;
};

export type TransformDatasetRequestType = {
  title: string;
  description: string;
  dataset_type: DatasetType;
  dedup_columns: string[];
  partition_columns: string[];
  provider: ProviderType;
  source_dataset_id: string;
  transformation_template_name: string;
  transformation_template_json: string;
};

export type TransformDatasetResponseType = {
  action_id: string; // poll this action_id to get the status
  dataset_id: string;
};

export type AdminDatasetType = {
  ID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  OrganizationId: string;
  Metadata: MapAny;
};

export type AdminDatasetListingResponseType = {
  datasets: AdminDatasetType[];
};
