import { capitalizeFirstLetter } from 'utils/common';

export enum CustomRole {
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const CUSTOM_ROLE_SELECT_DATA = [
  { label: capitalizeFirstLetter(CustomRole.MEMBER), value: CustomRole.MEMBER },
  { label: capitalizeFirstLetter(CustomRole.VIEWER), value: CustomRole.VIEWER },
];

export enum PeopleTabs {
  TEAM_MEMBERS = 'team members',
  INVITED = 'invited',
}

export const PEOPLE_TABS_LIST = [
  { label: capitalizeFirstLetter(PeopleTabs.TEAM_MEMBERS), value: PeopleTabs.TEAM_MEMBERS },
  { label: capitalizeFirstLetter(PeopleTabs.INVITED), value: PeopleTabs.INVITED },
];
