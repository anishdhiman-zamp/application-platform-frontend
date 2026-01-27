import { ReactNode } from 'react';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
  ARTIFACTS = 'artifacts',
}

export interface PaceNavbarItemSchema {
  id: PaceNavbarItemId;
  iconComponent: ReactNode;
  path: string;
}

export interface PaceSettingsTabSchema extends PaceNavbarItemSchema {
  name: string;
}
