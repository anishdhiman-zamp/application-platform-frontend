import { FC } from 'react';
import { COLORS } from 'constants/colors';
import { InvitedMembersNamePropsType } from 'modules/people/people.types';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import Avatar from 'components/common/avatar';

const InvitedMembersName: FC<InvitedMembersNamePropsType> = ({ value = '' }) => {
  return (
    <div className='flex items-center gap-1 w-full h-full'>
      <Avatar
        name={value}
        backgroundColor={COLORS.GRAY_1000}
        className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
      />
      <span className='f-12-400 text-GRAY_1000'>{convertEmailUsernameToName(getUserNameFromEmail(value))}</span>
    </div>
  );
};

export default InvitedMembersName;
