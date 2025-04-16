import { displayConfigType } from 'types/api/admin.types';
import { defaultFnType } from 'types/commonTypes';

export enum DISPLAY_CONFIG_HEADERS {
  COLUMN = 'column',
  IS_HIDDEN = 'is_hidden',
  IS_EDITABLE = 'is_editable',
  TYPE = 'type',
  AMOUNT_COLUMN = 'amount_column',
  CURRENCY_COLUMN = 'currency_column',
}

export type FormattedJsonPropsType = {
  originalJson: displayConfigType[];
  formattedJson: displayConfigType[];
  search: string;
};

export type AdminHeaderPropsType = {
  displayConfigInitialData: displayConfigType[];
  displayConfigFinalData: displayConfigType[];
  datasetId: string;
};

export type AdminDatasetByIdPropsType = {
  id: string;
};

export type JsonPreviewSidebarPropsType = {
  formattedJson: displayConfigType[];
  originalJson: displayConfigType[];
  onClose: defaultFnType;
  isOpen: boolean;
};

export enum AdminDatasetActionTypes {
  DELETE = 'delete',
  EDIT = 'edit',
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
  datasetId: string;
};

export enum NodeType {
  DATASET = 'dataset',
  FOLDER = 'folder',
}
