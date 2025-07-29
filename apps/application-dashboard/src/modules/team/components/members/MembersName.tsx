import { FC } from 'react';
import { useSelector } from 'react-redux';
import { COLORS } from 'constants/colors';
import { MembersNamePropsType } from 'modules/team/people.types';
import { RootState } from 'store';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import Avatar from 'components/common/avatar';

const MembersName: FC<MembersNamePropsType> = ({ name = '', value = '', member = false }) => {
  const isCurrentUser = useSelector((state: RootState) => state?.user?.user)?.user_email === value;
  const showCurrentUser = isCurrentUser && member;

  return (
    !!name && (
      <div className='flex h-full w-full items-center justify-start gap-1 px-2 py-3 text-left'>
        <Avatar
          name={name}
          backgroundColor={COLORS.GRAY_1000}
          className='f-8-400 flex h-4 w-4 items-center justify-center rounded-full text-white'
        />
        <div className='flex items-center justify-center gap-1'>
          <span className='f-12-400 text-GRAY_1000'>{convertEmailUsernameToName(getUserNameFromEmail(name))}</span>
          {showCurrentUser && <span className='f-12-400 text-GRAY_700'>(You)</span>}
        </div>
      </div>
    )
  );
};

export default MembersName;
