import { DisplayConfigType } from 'types/api/admin.types';
import { defaultFnType } from 'types/commonTypes';

export enum DISPLAY_CONFIG_HEADERS {
  COLUMN = 'column',
  ALIAS = 'alias',
  IS_HIDDEN = 'is_hidden',
  IS_EDITABLE = 'is_editable',
  TYPE = 'type',
  CONFIG = 'config',
}

export type FormattedJsonPropsType = {
  originalJson: DisplayConfigType[];
  formattedJson: DisplayConfigType[];
  search: string;
};

export type AdminHeaderPropsType = {
  displayConfigInitialData: DisplayConfigType[];
  displayConfigFinalData: DisplayConfigType[];
  datasetId: string;
};

export type AdminDatasetByIdPropsType = {
  id: string;
};

export type JsonPreviewSidebarPropsType = {
  formattedJson: DisplayConfigType[];
  originalJson: DisplayConfigType[];
  onClose: defaultFnType;
  isOpen: boolean;
};

export enum AdminDatasetActionTypes {
  DELETE = 'delete',
  EDIT = 'edit',
  EDIT_DATASET = 'edit_dataset',
}

export type AdminDeleteDatasetDetailsType = {
  datasetId: string;
  datasetName: string;
};

export enum DatasetType {
  SOURCE = 'source',
  STAGED = 'staged',
}

export enum ProviderType {
  DATABRICKS = 'databricks',
  PINOT = 'pinot',
}

export type EditDatasetType = {
  title: string;
  description: string;
  dedup_columns?: string[];
  partition_columns?: string[];
  cluster_columns?: string[];
  order_by_column?: string;
  datasetId: string;
  required_columns?: string[];
  is_eligible_for_file_imports?: boolean;
  dataset_type?: DatasetType;
};

export enum NodeType {
  DATASET = 'dataset',
  FOLDER = 'folder',
}
