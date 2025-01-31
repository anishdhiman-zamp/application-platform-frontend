import InvitedMembersEmail from 'modules/people/components/invitedMembers/InvitedMembersEmail';
import InvitedMembersName from 'modules/people/components/invitedMembers/InvitedMembersName';
import InvitedMembersRole from 'modules/people/components/invitedMembers/InvitedMembersRole';
import TeamMembersEmail from 'modules/people/components/teamMembers/TeamMembersEmail';
import TeamMembersName from 'modules/people/components/teamMembers/TeamMembersName';
import TeamMembersRole from 'modules/people/components/teamMembers/TeamMembersRole';
import { TEAM_MEMBERS_PRIVILEGES } from 'modules/people/people.types';
import { MapAny } from 'types/commonTypes';
import { capitalizeFirstLetter } from 'utils/common';

export const TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.name || value?.email,
    cellRenderer: TeamMembersName,
  },
  {
    headerName: 'Email',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.email,
    cellRenderer: TeamMembersEmail,
  },
  {
    headerName: 'Role',
    valueGetter: ({ data }: MapAny) => ({
      user_id: data?.user?.user_id,
      privilege: data?.privilege,
    }),
    cellRenderer: TeamMembersRole,
  },
];

export const INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'email',
    cellRenderer: InvitedMembersName,
  },
  {
    headerName: 'Email',
    field: 'email',
    cellRenderer: InvitedMembersEmail,
  },
  {
    headerName: 'Role',
    field: 'privilege',
    cellRenderer: InvitedMembersRole,
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
