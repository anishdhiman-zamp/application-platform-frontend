import { CustomRole } from 'modules/people/people.constants';

export type InviteMembersPopupPropsType = {
  isOpen: boolean;
  onClose?: () => void;
};

export type RoleOption = {
  label: string;
  value: CustomRole;
};
