import { FC } from 'react';
import { useSelector } from 'react-redux';
import { COLORS } from 'constants/colors';
import { RootState } from 'store';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import Avatar from 'components/common/avatar';

interface TeamMembersNameProps {
  valueFormatted: string;
}

const TeamMembersName: FC<TeamMembersNameProps> = ({ valueFormatted = '' }) => {
  const isCurrentUser = useSelector((state: RootState) => state?.user?.user)?.user_email === valueFormatted;

  return (
    !!valueFormatted && (
      <div className='flex items-center gap-1 w-full h-full'>
        <Avatar
          name={valueFormatted}
          backgroundColor={COLORS.GRAY_1000}
          className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
        />
        <div className='flex items-center justify-center gap-1'>
          <span className='f-12-400 text-GRAY_1000'>
            {convertEmailUsernameToName(getUserNameFromEmail(valueFormatted))}
          </span>
          {isCurrentUser && <span className='f-12-400 text-GRAY_700'>(You)</span>}
        </div>
      </div>
    )
  );
};

export default TeamMembersName;
