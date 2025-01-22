import { FC } from 'react';

interface TeamMembersEmailProps {
  valueFormatted: string;
}

const TeamMembersEmail: FC<TeamMembersEmailProps> = ({ valueFormatted = '' }) => {
  return <div className='f-12-400 text-GRAY_1000 h-full flex items-center'>{valueFormatted}</div>;
};

export default TeamMembersEmail;
