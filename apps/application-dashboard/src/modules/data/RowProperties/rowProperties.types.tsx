import { MapAny } from '@/types/commonTypes';

export enum ROW_PROPERTIES_TABS_TYPES {
  PROPERTIES = 'properties',
  RULES = 'rules',
}

export enum TAG_SOURCE_TYPES {
  RULE = 'rule',
  USER = 'user',
}

export type RuleConfigType = {
  id: string;
  tagColorMap: MapAny;
};
