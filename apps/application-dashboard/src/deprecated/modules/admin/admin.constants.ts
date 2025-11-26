import ValueFormatEditor from '@/components/common/table/CustomCellEditors/ValueFormatEditor';
import ValueFormatCell from '@/components/common/table/CustomCellRenderers/ValueFormatCell';
import { CUSTOM_COLUMNS_TYPE, VALUE_FORMAT_TYPE } from '@/components/common/table/table.types';
import {
  AdminDatasetActionTypes,
  DatasetType,
  DISPLAY_CONFIG_HEADERS,
  ProviderType,
} from '@/deprecated/modules/admin/admin.types';
import { MarkerType } from '@xyflow/react';
import { ColDef } from 'ag-grid-community';
import { COLORS } from 'constants/colors';

export const DATASET_ACTIONS = [
  {
    label: 'Edit Display Config',
    value: AdminDatasetActionTypes.EDIT,
    iconId: 'pencil-02',
  },
  {
    label: 'Edit Dataset',
    value: AdminDatasetActionTypes.EDIT_DATASET,
    iconId: 'pen-tool-02',
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
  { label: 'Source (will be visible to users)', value: DatasetType.SOURCE },
  { label: 'Staged (will not be visible to users)', value: DatasetType.STAGED },
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

export const TRANSFORM_DATASET_LABEL_PROPS = {
  input: {
    labelClassName: 'mb-1!',
    className: 'w-full space-y-2',
  },
  dropdown: {
    titleClassName: 'f-12-500 text-GRAY_900 mb-1 select-none',
    wrapperClassName: 'w-full mb-2',
  },
};

export const S3_INGESTION_EDGE_LABEL = 'S3 ingestion';

export const DISPLAY_TYPE_OPTIONS: { label: CUSTOM_COLUMNS_TYPE; value: CUSTOM_COLUMNS_TYPE }[] = Object.values(
  CUSTOM_COLUMNS_TYPE,
).map((type) => ({
  label: type,
  value: type,
}));

export const FORMAT_TYPE_OPTIONS: { label: VALUE_FORMAT_TYPE; value: VALUE_FORMAT_TYPE }[] = Object.values(
  VALUE_FORMAT_TYPE,
).map((type) => ({
  label: type,
  value: type,
}));

export const DisplayConfigHeadersListV2: ColDef[] = [
  {
    field: DISPLAY_CONFIG_HEADERS.COLUMN,
    headerName: 'Column',
    rowDrag: true,
  },
  {
    field: DISPLAY_CONFIG_HEADERS.ALIAS,
    headerName: 'Alias',
    editable: true,
  },
  {
    field: DISPLAY_CONFIG_HEADERS.CONFIG,
    headerName: 'Value Format',
    cellRenderer: ValueFormatCell,
    cellEditor: ValueFormatEditor,
    editable: true,
  },
  {
    field: DISPLAY_CONFIG_HEADERS.TYPE,
    headerName: 'Type',
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: Object.values(CUSTOM_COLUMNS_TYPE),
    },
  },
  {
    field: DISPLAY_CONFIG_HEADERS.IS_HIDDEN,
    headerName: 'Is Hidden',
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: [true, false],
    },
  },
  {
    field: DISPLAY_CONFIG_HEADERS.IS_EDITABLE,
    headerName: 'Is Editable',
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: [true, false],
    },
  },
];
