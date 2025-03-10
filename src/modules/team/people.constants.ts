import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import { TEAM_MEMBERS_PRIVILEGES } from 'modules/team/people.types';
import { MapAny } from 'types/commonTypes';
import { capitalizeFirstLetter } from 'utils/common';

export const TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.name || value?.email,
    cellRenderer: MembersName,
  },
  {
    headerName: 'Email',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.email,
    cellRenderer: MembersEmail,
  },
  {
    headerName: 'Role',
    valueGetter: ({ data }: MapAny) => ({
      user_id: data?.user?.user_id,
      privilege: data?.privilege,
    }),
    cellRenderer: MembersRole,
  },
];

export const INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'email',
    cellRenderer: MembersName,
  },
  {
    headerName: 'Email',
    field: 'email',
    cellRenderer: MembersEmail,
  },
  {
    headerName: 'Invited as',
    field: 'privilege',
    cellRenderer: MembersRole,
  },
];

export const TEAM_MEMBERS_LISTING_TABLE_THEME = {
  rowHeight: 44,
  rowHoverColor: 'transparent',
  cellHorizontalPadding: 8,
};

export const TEAM_MEMBERS_PRIVILEGES_LIST = [
  {
    label: 'System Admin',
    value: TEAM_MEMBERS_PRIVILEGES.SYSTEM_ADMIN,
  },
  {
    label: 'Member',
    value: TEAM_MEMBERS_PRIVILEGES.MEMBER,
  },
];

export enum PeopleTabs {
  TEAM_MEMBERS = 'team members',
  INVITED = 'invited',
}

export const PEOPLE_TABS_LIST = [
  { label: capitalizeFirstLetter(PeopleTabs.TEAM_MEMBERS), value: PeopleTabs.TEAM_MEMBERS },
  { label: capitalizeFirstLetter(PeopleTabs.INVITED), value: PeopleTabs.INVITED },
];

export const TEAMS_LIST_DUMMY_DATA = [
  {
    value: 'engg',
    label: 'Engg',
    color: '#E3E5FB',
  },
  {
    value: 'design',
    label: 'Design',
    color: '#FBE3E5',
  },
  {
    value: 'product',
    label: 'Product',
    color: '#FBE3E5',
  },
  {
    value: 'marketing',
    label: 'Marketing',
    color: '#E2F1E0',
  },
  {
    value: 'sales',
    label: 'Sales',
    color: '#E2F1E0',
  },
];
