import { RefObject } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { FilterConfig } from 'modules/widgets/Pivot/pivot.types';
import { DatasetFilterConfigResponseType } from '@/types/api/dataset.types';
import { MissingFieldItemType } from '@/types/api/processApi.types';
import { defaultFnType, MapAny } from '@/types/commonTypes';

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
  columnName?: string;
  isVisible: boolean;
  width: number;
};

export enum DATASET_ACTION_TYPE {
  TAGGING = 'tagging',
  RULE_DELETION = 'rule_deletion',
  UPDATE_MISSING_FIELD = 'update_missing_field',
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

export type HandleDisplayConfigUpdateParamsType = {
  columnId: string;
  value: string | boolean;
};

export type FormatColumnsParamsType = {
  filterConfig: DatasetFilterConfigResponseType[];
  currentUserHasEditAccess?: boolean;
  datasetId: string;
  handleSuccessfulUpdate?: defaultFnType;
  tableRef: RefObject<AgGridReact | null>;
  handleRulesListingSideDrawerOpen?: (ruleColumnDetailsValue: RuleColumnDetailsType) => void;
  sortColumn?: string;
  sortOrder?: string;
  isProcess?: boolean;
  isMenuDisabled?: boolean;
  missingFields?: MissingFieldItemType[];
  wrapLink?: boolean;
  isSelfServe?: boolean;
  isArtifact?: boolean;
};

export interface FrontendColumnConfig {
  datasetId: string;
  handleSuccessfulUpdate: defaultFnType;
  tableRef: RefObject<AgGridReact | null>;
}
export interface ItemWithId {
  id: string;
}
