import { DynamicTabType } from 'modules/pace/pace.types';

export interface Artifact {
  id: string;
  name: string;
  type: DynamicTabType;
  updatedAt: string;
  sheetId?: string;
}
