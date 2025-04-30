import { RowClickedEvent } from 'ag-grid-community';
import type { FilterConfig } from 'modules/widgets/Pivot/pivot.types';
import { MapAny } from '@/types/commonTypes';

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

export type RuleColumnDetailsType = {
  colId: string;
  columnLabel: string;
  tagColorMap: MapAny;
};

export type DatasetUrlDataType = {
  [key: string]: {
    title: string;
    filters?: Record<string, FilterConfig>;
  };
};

export type DatasetTabType = {
  id: string;
  title: string;
  filters?: Record<string, FilterConfig>;
};
