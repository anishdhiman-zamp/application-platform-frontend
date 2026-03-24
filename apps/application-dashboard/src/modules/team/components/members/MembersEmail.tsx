import { FC } from 'react';
import { MembersEmailPropsType } from 'modules/team/people.types';

const MembersEmail: FC<MembersEmailPropsType> = ({ value = '' }) => {
  return (
    <div className='sensitive f-12-400 text-GRAY_1000 flex h-full min-w-0 items-start justify-start px-2 py-3 text-left'>
      <span className='truncate' title={value}>
        {value}
      </span>
    </div>
  );
};

export default MembersEmail;
