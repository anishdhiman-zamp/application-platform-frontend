import { FC } from 'react';

interface TeamMembersEmailProps {
  value: string;
}

const TeamMembersEmail: FC<TeamMembersEmailProps> = ({ value = '' }) => {
  return (
    <div className='f-12-400 text-GRAY_1000 h-full flex items-center justify-start text-left py-3 px-2'>{value}</div>
  );
};

export default TeamMembersEmail;
