import { TEAM_MEMBERS_PRIVILEGES } from 'modules/people/people.constants';

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

