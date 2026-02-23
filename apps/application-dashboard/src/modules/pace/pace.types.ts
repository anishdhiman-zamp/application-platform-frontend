import { ReactNode } from 'react';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
  ARTIFACTS = 'artifacts',
  FILES = 'files',
}

export interface PaceNavbarItemSchema {
  id: PaceNavbarItemId;
  iconComponent: ReactNode;
  path: string;
}

export interface PaceSettingsTabSchema extends PaceNavbarItemSchema {
  name: string;
}

export const enum DynamicTabType {
  PAGE = 'page',
  DATASET = 'dataset',
  FILE = 'file',
}

export interface DynamicTab {
  id: string;
  name: string;
  type: DynamicTabType;
  path: string;
}
