import { FC } from 'react';
import { CSS_VARS } from '@zamp-platform/ui';
import { MembersNamePropsType } from 'modules/team/people.types';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import Avatar from 'components/common/avatar';

const MembersName: FC<MembersNamePropsType> = ({ name = '', value = '', member = false }) => {
  const { isCurrentUserEmail } = useUserIdentity();
  const isCurrentUser = isCurrentUserEmail(value);
  const showCurrentUser = isCurrentUser && member;

  return (
    !!name && (
      <div className='flex h-full w-full min-w-0 items-center justify-start gap-1 px-2 py-3 text-left'>
        <Avatar
          name={name}
          backgroundColor={CSS_VARS.GRAY_1000}
          className='f-8-400 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white dark:text-black'
        />
        <div className='flex min-w-0 items-center gap-1'>
          <span
            className='f-12-400 text-GRAY_1000 truncate'
            title={convertEmailUsernameToName(getUserNameFromEmail(name))}
          >
            {convertEmailUsernameToName(getUserNameFromEmail(name))}
          </span>
          {showCurrentUser && <span className='f-12-400 text-GRAY_700 shrink-0'>(You)</span>}
        </div>
      </div>
    )
  );
};

export default MembersName;
