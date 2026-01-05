import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import { TEAM_MEMBERS_PRIVILEGES } from 'modules/team/people.types';
import { MapAny } from 'types/commonTypes';
import { capitalizeFirstLetter } from 'utils/common';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/constants/payments.constants';

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
  {
    headerName: 'Team',
    field: 'team',
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

export const PRIVILEGES_LIST = [
  {
    label: 'System Admin',
    value: TEAM_MEMBERS_PRIVILEGES.SYSTEM_ADMIN,
  },
  {
    label: 'Admin',
    value: TEAM_MEMBERS_PRIVILEGES.ADMIN,
  },
  {
    label: 'Member',
    value: TEAM_MEMBERS_PRIVILEGES.MEMBER,
  },
  {
    label: 'Remove',
    value: TEAM_MEMBERS_PRIVILEGES.REMOVE,
  },
  {
    label: 'Initiator',
    value: TEAM_MEMBERS_PRIVILEGES.INITIATOR,
  },
  {
    label: 'Viewer',
    value: TEAM_MEMBERS_PRIVILEGES.VIEWER,
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

export enum TEAM_PERMISSION_TOAST_MSG {
  TEAM_ASSIGN_SUCCESS = 'Team assigned successfully',
  TEAM_ASSIGN_ERROR = 'Failed to assign team',
  TEAM_CREATE_ERROR = 'Failed to create team',
  INVALID_TEAM_ERROR = 'Invalid team',
  TEAM_REMOVE_SUCCESS = 'Team removed successfully',
  TEAM_REMOVE_ERROR = 'Failed to remove team',
}

export const DUAL_ADMIN_APPROVAL_POLICY_OPTIONS = [
  {
    label: 'Approve',
    value: TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE,
    icon: 'check',
  },
  {
    label: 'Reject',
    value: TEMPLATE_APPROVAL_ACTION_TYPES.REJECT,
    icon: 'x-close',
  },
];

export enum USER_APPROVAL_ACTION_TYPES {
  REMOVE_USER_FROM_TEAM = 'REMOVE_USER_FROM_TEAM',
  ADD_USER_TO_TEAM = 'ADD_USER_TO_TEAM',
  UPDATE_USER_ACCESS = 'UPDATE_USER_ACCESS',
  REMOVE_USER_ACCESS = 'REMOVE_USER_ACCESS',
  CREATE_USER_INVITATION = 'CREATE_USER_INVITATION',
}
