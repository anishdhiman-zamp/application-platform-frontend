import { DatasetType, ProviderType } from 'modules/admin/admin.types';
import { ValueFormatType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { APITags } from '@/constants/api.constants';

export type GetDatasetDisplayConfigRequestType = {
  datasetId: string;
};

export type DisplayConfigType = {
  column: string;
  alias?: string;
  is_hidden: boolean;
  is_editable: boolean;
  type?: CUSTOM_COLUMNS_TYPE;
  config?: {
    value_format?: ValueFormatType[];
  };
};

export type GetDatasetDisplayConfigResponseType = {
  display_config: DisplayConfigType[];
};

export type PostDatasetDisplayConfigRequestType = {
  datasetId: string;
  body: { display_config: DisplayConfigType[] };
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
  dedup_columns?: string[];
  s3_path: string;
  partition_columns?: string[];
  cluster_columns?: string[];
  provider: ProviderType;
  order_by_column?: string;
};

export type CreateDatasetResponseType = {
  action_id: string; // poll this action_id to get the status of the dataset creation
  dataset_id: string;
  register_dataset_action_id?: string;
};

export type TransformDatasetRequestType = {
  title: string;
  description: string;
  dataset_type: DatasetType;
  dedup_columns?: string[];
  partition_columns?: string[];
  order_by_column?: string;
  provider: ProviderType;
  source_dataset_id: string;
  transformation_template_name: string;
  transformation_template_json: string;
  destination_dataset_id?: string;
  cluster_columns?: string[];
};

export type TransformDatasetResponseType = {
  action_id: string; // poll this action_id to get the status
  dataset_id: string;
};

export type AdminDatasetMetadataType = {
  databricks_config: {
    dedup_columns: string[];
    cluster_columns: string[];
    order_by_column: string;
    partition_columns: string[];
  };
};

export type AdminDatasetType = {
  ID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  OrganizationId: string;
  Metadata: AdminDatasetMetadataType;
};

export type AdminDatasetListingResponseType = {
  datasets: AdminDatasetType[];
};

export type GetTemplatesRequestType = {
  template_ids: string[];
};

export type TemplateType = {
  id: string;
  name: string;
  configuration: string;
  template_type: string;
  metadata: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  is_deleted: boolean;
  deleted_at: string;
  deleted_by: string;
};

export type GetTemplatesResponseType = {
  templates: TemplateType[];
};

export type UpsertTemplateRequestType = {
  id: string;
  name: string;
  configuration: string;
};

export type UpsertTemplateResponseType = {
  action_id: string;
};

export interface DatasetColumnConfig {
  is_required: boolean;
}

export interface Rule {
  id: string;
  priority: number;
  value_to_apply: string;
  sql_condition: string;
  sql_args: MapAny;
}
export interface DatasetConfig {
  columns: Record<string, DatasetColumnConfig>;
  custom_column_groups: { type: string; config: Record<string, string> }[];
  rules: Record<string, Rule[]>;
}

export type UpdateDatasetRequestType = {
  datasetId: string;
  title?: string;
  description?: string;
  dedup_columns?: string[];
  cluster_columns?: string[];
  partition_columns?: string[];
  order_by_column?: string;
  display_config?: DisplayConfigType[];
  dataset_config?: DatasetConfig;
  invalidateTags?: APITags[];
};

export type UpdateDatasetResponseType = {
  action_id: string;
  dataset_id: string;
};
