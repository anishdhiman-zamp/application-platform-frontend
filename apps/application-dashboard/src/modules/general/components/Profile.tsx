'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { SettingsRow } from '@/modules/general/components/SettingsRow';
import { PROFILE_ROWS } from '@/modules/general/constants/general.constants';
import { useCopyToClipboard } from '@/modules/general/hooks/useCopyToClipboard';

const Profile = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { copied, handleCopy } = useCopyToClipboard(user?.user_id ?? '');

  return (
    <div className='flex flex-col'>
      <h1 className='f-20-600 text-GRAY_1000 pb-4'>Profile</h1>
      <div className='border-GRAY_400 rounded-2xl border'>
        <SettingsRow label={PROFILE_ROWS[0].label} value={user?.user_email ?? ''} action={{ text: 'Manage' }} />
        <SettingsRow
          label={PROFILE_ROWS[1].label}
          value={user?.user_id ?? ''}
          action={{ text: copied ? 'Copied!' : 'Copy', onClick: handleCopy, className: 'w-16' }}
        />
        <SettingsRow
          label={PROFILE_ROWS[2].label}
          value={PROFILE_ROWS[2].value}
          className='border-none'
          action={{ text: 'Delete account', onClick: () => {}, variant: 'destructive-outline' }}
        />
      </div>
    </div>
  );
};

export default Profile;
