import type { LucideIcon } from 'lucide-react';
import { Braces, Calendar, Circle, FilePen, Hash, Sheet, Type } from 'lucide-react';

export enum DatasetTabsTypes {
  PREVIEW = 'preview',
  BLUEPRINT = 'blueprint',
}

export enum DatasetColumnHeaderTypes {
  GRIP = 'grip',
  COLUMN_NAME = 'column_name',
  COLUMN_TYPE = 'column_type',
  REQUIRED = 'required',
  ACTIONS = 'actions',
  HIDDEN = 'hidden',
}

export enum DatasetColumnTypes {
  TEXT = 'TEXT',
  TIMESTAMP = 'TIMESTAMP',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE',
  DOUBLE_PRECISION = 'DOUBLE_PRECISION',
  JSON = 'JSON',
}

export const DATASET_PLAYGROUND_TABS_LIST: Array<{
  label: string;
  value: DatasetTabsTypes;
  icon: LucideIcon;
  description: string;
}> = [
  {
    label: 'Dataset Blueprint',
    value: DatasetTabsTypes.BLUEPRINT,
    icon: FilePen,
    description: 'Allows you to configure columns of this dataset',
  },
  {
    label: 'Dataset Preview',
    value: DatasetTabsTypes.PREVIEW,
    icon: Sheet,
    description: 'Preview how your dataset will look',
  },
];

export const DATASET_COLUMN_HEADERS_LIST = [
  { label: '', value: DatasetColumnHeaderTypes.GRIP, width: 30 },
  { label: 'Column Name', value: DatasetColumnHeaderTypes.COLUMN_NAME, width: 380 },
  { label: 'Column Type', value: DatasetColumnHeaderTypes.COLUMN_TYPE, width: 200 },
  { label: 'Required', value: DatasetColumnHeaderTypes.REQUIRED },
  { label: '', value: DatasetColumnHeaderTypes.HIDDEN, width: 80 },
  { label: '', value: DatasetColumnHeaderTypes.ACTIONS, width: 20 },
];

export const DATASET_COLUMN_TYPES_LIST: Array<{
  label: string;
  value: DatasetColumnTypes;
  icon: LucideIcon;
}> = [
  { label: 'Text', value: DatasetColumnTypes.TEXT, icon: Type },
  { label: 'Date and Time', value: DatasetColumnTypes.TIMESTAMP, icon: Calendar },
  { label: 'Integer', value: DatasetColumnTypes.INTEGER, icon: Hash },
  { label: 'Boolean', value: DatasetColumnTypes.BOOLEAN, icon: Circle },
  { label: 'Float', value: DatasetColumnTypes.FLOAT, icon: Hash },
  { label: 'Double', value: DatasetColumnTypes.DOUBLE || DatasetColumnTypes.DOUBLE_PRECISION, icon: Hash },
  { label: 'JSON', value: DatasetColumnTypes.JSON, icon: Braces },
];

/** Default dataset ID used for preview mode (before dataset is saved to backend) */
export const PREVIEW_DATASET_ID = 'preview-dataset';

/** AG Grid event source for user-initiated column moves */
export const UI_COLUMN_MOVED = 'uiColumnMoved';

/** Toast messages for dataset operations */
export const DATASET_TOAST_MESSAGES = {
  // Success messages
  DATASET_CREATED_SUCCESS: 'Dataset created successfully',
  DATASET_UPDATED_SUCCESS: 'Dataset updated successfully',
  DATASET_UPDATE_FAILED: 'Dataset update failed',
  // Error messages
  COLUMN_NAME_EMPTY: 'Column name cannot be empty',
  DUPLICATE_DATASET_NAME: 'Dataset name already exists',
  NO_CHANGES_TO_SAVE: 'No changes to save',
  NO_PERMISSION_TO_EDIT_DATASET: "You don't have permission to edit this dataset",
  DUPLICATE_COLUMN_NAME: 'Column names must be unique',
} as const;

/** Radio options for timestamp default values */
export const TIMESTAMP_DEFAULT_OPTIONS = [
  { value: 'CURRENT_TIMESTAMP', label: 'Current date and time' },
  { value: 'CURRENT_DATE', label: 'Current date' },
];

/** Radio options for boolean default values */
export const BOOLEAN_DEFAULT_OPTIONS = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
];

/** System columns that should be excluded from user-facing column lists */
export const SYSTEM_COLUMNS: string[] = ['id', 'created_at', 'updated_at', '_zamp_is_deleted'];

/** Column type configuration with display labels and format hints */
export const COLUMN_TYPE_CONFIG: Record<string, { label: string; formatHint: string }> = {
  [DatasetColumnTypes.TEXT]: { label: 'Text', formatHint: 'TEXT' },
  [DatasetColumnTypes.TIMESTAMP]: { label: 'Timestamp', formatHint: 'TIMESTAMP' },
  [DatasetColumnTypes.INTEGER]: { label: 'Integer', formatHint: 'INTEGER' },
  [DatasetColumnTypes.BOOLEAN]: { label: 'Boolean', formatHint: 'BOOLEAN' },
  [DatasetColumnTypes.FLOAT]: { label: 'Float', formatHint: 'FLOAT' },
  [DatasetColumnTypes.DOUBLE]: { label: 'Double', formatHint: 'DOUBLE' },
  [DatasetColumnTypes.JSON]: { label: 'JSON', formatHint: 'JSON' },
};
