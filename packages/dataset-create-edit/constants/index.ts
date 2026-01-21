import type { LucideIcon } from 'lucide-react';
import { Calendar, FilePen, FileText, Hash, Link, Mail, Sheet, Type } from 'lucide-react';

export enum DatasetTabsTypes {
  PREVIEW = 'preview',
  BLUEPRINT = 'blueprint',
}

export enum DatasetColumnHeaderTypes {
  COLUMN_NAME = 'column_name',
  COLUMN_TYPE = 'column_type',
  REQUIRED = 'required',
  ACTIONS = 'actions',
}

export enum DatasetColumnTypes {
  TEXT = 'text',
  FILE = 'file',
  LINK = 'link',
  DATE = 'date',
  NUMBER = 'number',
  EMAIL = 'email',
}

export const DATASET_PLAYGROUND_TABS_LIST: Array<{
  label: string;
  value: DatasetTabsTypes;
  icon: LucideIcon;
}> = [
  { label: 'Blueprint', value: DatasetTabsTypes.BLUEPRINT, icon: FilePen },
  { label: 'Preview', value: DatasetTabsTypes.PREVIEW, icon: Sheet },
];

export const DATASET_COLUMN_HEADERS_LIST = [
  { label: 'Column Name', value: DatasetColumnHeaderTypes.COLUMN_NAME },
  { label: 'Column Type', value: DatasetColumnHeaderTypes.COLUMN_TYPE, width: 200 },
  { label: 'Required', value: DatasetColumnHeaderTypes.REQUIRED },
  { label: '', value: DatasetColumnHeaderTypes.ACTIONS, width: 20 },
];

export const DATASET_COLUMN_TYPES_LIST: Array<{
  label: string;
  value: DatasetColumnTypes;
  icon: LucideIcon;
}> = [
  { label: 'Text', value: DatasetColumnTypes.TEXT, icon: Type },
  { label: 'File', value: DatasetColumnTypes.FILE, icon: FileText },
  { label: 'Link', value: DatasetColumnTypes.LINK, icon: Link },
  { label: 'Date', value: DatasetColumnTypes.DATE, icon: Calendar },
  { label: 'Number', value: DatasetColumnTypes.NUMBER, icon: Hash },
  { label: 'Email', value: DatasetColumnTypes.EMAIL, icon: Mail },
];

/** Default dataset ID used for preview mode (before dataset is saved to backend) */
export const PREVIEW_DATASET_ID = 'preview-dataset';

/** AG Grid event source for user-initiated column moves */
export const UI_COLUMN_MOVED = 'uiColumnMoved';
