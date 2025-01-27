import { FC } from 'react';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { TeamMembersRolePropsType } from 'modules/people/people.types';

const TeamMembersRole: FC<TeamMembersRolePropsType> = ({ value = '' }) => {
  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((item) => item.value === value)?.label;

  return <div className='flex gap-2 items-center h-full f-12-400 text-GRAY_1000'>{role}</div>;
};

export default TeamMembersRole;
