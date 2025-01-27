import { TEAM_MEMBERS_PRIVILEGES } from 'modules/people/people.constants';
import { InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';

export type InviteMembersPopupPropsType = {
  isOpen: boolean;
  onClose?: () => void;
};

export type TeamMembersPrivilegeType = {
  label: string;
  value: TEAM_MEMBERS_PRIVILEGES;
};

export type RemoveFromTeamPopupPropsType = {
  name: string;
  isOpen: boolean;
  onClose?: () => void;
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
  value: string;
};
