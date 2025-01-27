import { FC } from 'react';
import { InvitedMembersEmailPropsType } from 'modules/people/people.types';

const InvitedMembersEmail: FC<InvitedMembersEmailPropsType> = ({ value = '' }) => {
  return <div className='f-12-400 text-GRAY_1000 h-full flex items-center'>{value}</div>;
};

export default InvitedMembersEmail;
