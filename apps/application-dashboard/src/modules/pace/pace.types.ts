import { ReactNode } from 'react';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
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

export interface DynamicTab {
  stableKey: string;
  id: string;
  name: string;
  path: string;
}
