import { FC } from 'react';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';

interface TeamMembersRoleProps {
  value: string;
}

const TeamMembersRole: FC<TeamMembersRoleProps> = ({ value = '' }) => {
  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((item) => item.value === value)?.label;

  return (
    <div className='flex gap-2 items-center h-full'>
      <div className='f-12-400 text-GRAY_1000'>{role}</div>
    </div>
  );
};

export default TeamMembersRole;
