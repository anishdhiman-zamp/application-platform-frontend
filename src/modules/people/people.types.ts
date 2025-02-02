import { InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { defaultFnType } from 'types/commonTypes';

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
  feature?: string;
  warningDescription: string;
};

export type InvitedMembersEmailPropsType = {
  value: string;
};

export type InvitedMembersListingPropsType = {
  data: InvitedAudiencesByOrganisationIdResponse[];
};

export type InvitedMembersNamePropsType = {
  value: string;
};

export type TeamMembersRolePropsType = {
  value: { user_id: string; privilege: string };
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

export type InvitedMembersRolePropsType = {
  value: string;
};
