import { capitalizeFirstLetter } from 'utils/common';

export enum CustomRole {
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const CUSTOM_ROLE_SELECT_DATA = [
  { label: capitalizeFirstLetter(CustomRole.MEMBER), value: CustomRole.MEMBER },
  { label: capitalizeFirstLetter(CustomRole.VIEWER), value: CustomRole.VIEWER },
];
