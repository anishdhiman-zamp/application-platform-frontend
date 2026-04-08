'use client';

import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { SettingsRow } from '@/modules/general/components/SettingsRow';
import { PROFILE_ROWS } from '@/modules/general/constants/general.constants';
import { useCopyToClipboard } from '@/modules/general/hooks/useCopyToClipboard';
import SettingsLogoutButton from '@/modules/pace/components/layout/settings-sidebar/SettingsLogoutButton';

const Profile = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { organizationId } = useUserIdentity();
  const { copied: userIdCopied, handleCopy: handleCopyUserId } = useCopyToClipboard(user?.user_id ?? '');
  const { copied: orgIdCopied, handleCopy: handleCopyOrgId } = useCopyToClipboard(organizationId);

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between pb-4'>
        <h1 className='f-20-600 text-GRAY_1000'>Profile</h1>
        <SettingsLogoutButton />
      </div>
      <div className='border-GRAY_400 rounded-2xl border'>
        <SettingsRow label={PROFILE_ROWS[0].label} value={user?.user_email ?? ''} />
        <SettingsRow
          label={PROFILE_ROWS[1].label}
          value={user?.user_id ?? ''}
          action={{ text: userIdCopied ? 'Copied!' : 'Copy', onClick: handleCopyUserId, className: 'w-16' }}
        />
        <SettingsRow
          label='Organisation ID'
          value={organizationId}
          action={{ text: orgIdCopied ? 'Copied!' : 'Copy', onClick: handleCopyOrgId, className: 'w-16' }}
          className='border-none'
        />
      </div>
    </div>
  );
};

export default Profile;
