import { FC } from 'react';
import { COLORS } from 'constants/colors';
import Avatar from 'components/common/avatar';

interface TeamMembersNameProps {
  valueFormatted: string;
}

const TeamMembersName: FC<TeamMembersNameProps> = ({ valueFormatted = '' }) => {
  return (
    !!valueFormatted && (
      <div className='flex items-center gap-1 w-full h-full'>
        <Avatar
          name={valueFormatted}
          backgroundColor={COLORS.GRAY_1000}
          className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
        />
        <div className='f-12-400 text-GRAY_1000'>{valueFormatted}</div>
      </div>
    )
  );
};

export default TeamMembersName;
