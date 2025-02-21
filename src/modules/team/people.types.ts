import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { defaultFnType } from 'types/commonTypes';

export enum TEAM_TABS_TYPES {
  TEAM_MEMBERS = 'team_members',
  INVITED_MEMBERS = 'invited_members',
}

export const TeamTabsList = [
  { label: 'Team members', value: TEAM_TABS_TYPES.TEAM_MEMBERS },
  { label: 'Invited', value: TEAM_TABS_TYPES.INVITED_MEMBERS },
];

export type InviteMembersPopupPropsType = {
  isOpen: boolean;
  onClose?: defaultFnType;
};

export type TeamMembersPrivilegeType = {
  label: string;
  value: TEAM_MEMBERS_PRIVILEGES;
};

export type RemoveFromTeamPopupPropsType = {
  name?: string;
  isOpen: boolean;
  onClose?: defaultFnType;
  onDelete?: defaultFnType;
  isLoading?: boolean;
  feature?: string;
  warningDescription: string;
};

export type MembersEmailPropsType = {
  value: string;
};

export type InvitedMembersListingPropsType = {
  isLoadingInvitedTeamMembersData: boolean;
  data: InvitedAudiencesByOrganisationIdResponse[];
};

export type MembersNamePropsType = {
  value: string;
  member?: boolean;
};

export type MembersRolePropsType = {
  value: { user_id: string; privilege: string };
  member?: boolean;
};

export enum TEAM_MEMBERS_PRIVILEGES {
  SYSTEM_ADMIN = 'system_admin',
  MEMBER = 'member',
  REMOVE = 'remove',
}

export type TeamMemberAccessPrivilegesType = {
  label: string;
  value: TEAM_MEMBERS_PRIVILEGES;
};

export type EmptyStateListingPropsType = {
  title?: string;
};

export type TeamMembersListingPropsType = {
  isLoadingTeamMembersData: boolean;
  data: AudiencesByOrganisationIdResponse[];
};
