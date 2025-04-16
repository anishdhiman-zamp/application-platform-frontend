import { RowClickedEvent } from 'ag-grid-community';

export type UserAccessToDataSetType = {
  name: string;
  privilege: string;
  resource_type: string;
}[];

export enum DATASET_ACTION_STATUS {
  INITIATED = 'INITIATED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

export type DatasetColumnRequest = {
  dataset_id: string;
  columns: string[];
};

export enum LOADER_STATUS {
  ALIGNMENT_PENDING = 'allignment_pending',
  ALIGNMENT_COMPLETED = 'allignment_completed',
  INITIATED = 'initiated',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type ListingPropsType = {
  onRowClicked: (event: RowClickedEvent) => void;
};

export type ColumnOrderingVisibilityType = {
  colId: string;
  isVisible: boolean;
  width: number;
};

export enum DATASET_ACTION_TYPE {
  TAGGING = 'tagging',
  RULE_DELETION = 'rule_deletion',
}
