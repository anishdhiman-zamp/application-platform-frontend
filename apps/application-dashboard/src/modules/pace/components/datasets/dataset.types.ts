import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';

export interface BlueprintColumn {
  id: string;
  name: string;
  type: DatasetColumnTypes;
  required: boolean;
  defaultValue?: string | null;
  frozen?: boolean;
}

export interface ColumnModification {
  oldName: string;
  newName?: string;
  setNotNull?: boolean;
  dropNotNull?: boolean;
  defaultValue?: string | null;
}
