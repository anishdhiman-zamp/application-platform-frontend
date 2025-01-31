import React, { FC } from 'react';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { InvitedMembersRolePropsType } from 'modules/people/people.types';

const InvitedMembersRole: FC<InvitedMembersRolePropsType> = ({ value }) => {
  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((role) => role?.value === value);

  return <div className='flex gap-2 items-center h-full f-12-400 text-GRAY_1000'>{role?.label}</div>;
};

export default InvitedMembersRole;
