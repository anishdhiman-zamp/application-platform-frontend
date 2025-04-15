import { MarkerType } from '@xyflow/react';
import { ColDef } from 'ag-grid-community';
import { COLORS } from 'constants/colors';
import { AdminDatasetActionTypes, DatasetType, DISPLAY_CONFIG_HEADERS, ProviderType } from 'modules/admin/admin.types';

export const DisplayConfigHeadersList = [
  {
    key: DISPLAY_CONFIG_HEADERS.COLUMN,
    value: 'Column',
  },
  {
    key: DISPLAY_CONFIG_HEADERS.IS_HIDDEN,
    value: 'Is Hidden',
  },
  {
    key: DISPLAY_CONFIG_HEADERS.IS_EDITABLE,
    value: 'Is Editable',
  },
  {
    key: DISPLAY_CONFIG_HEADERS.TYPE,
    value: 'Type',
  },
  {
    key: DISPLAY_CONFIG_HEADERS.AMOUNT_COLUMN,
    value: 'Amount Column',
  },
  {
    key: DISPLAY_CONFIG_HEADERS.CURRENCY_COLUMN,
    value: 'Currency Column',
  },
];

export const DATASET_ACTIONS = [
  {
    label: 'Edit Display Config',
    value: AdminDatasetActionTypes.EDIT,
    iconId: 'pencil-02',
  },
];

export const EdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.BLACK },
};

export const ProviderOptions = [
  { label: 'Databricks', value: ProviderType.DATABRICKS },
  { label: 'Pinot', value: ProviderType.PINOT },
];

export const DatasetTypeOptions = [
  { label: 'Source', value: DatasetType.SOURCE },
  { label: 'Staged', value: DatasetType.STAGED },
];

export const ADMIN_DATASET_LISTING_COLUMNS: ColDef[] = [
  {
    field: 'Title',
    headerName: 'Datasets',
  },
  {
    field: 'Description',
    headerName: 'Description',
  },
];
