'use client';

import { Button } from '@zamp-platform/ui';
import { Loader2, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

const SettingsLogoutButton = () => {
  const { logout, isLoggingOut } = useLogout();

  return (
    <Button
      variant='outline'
      size='small'
      onClick={logout}
      disabled={isLoggingOut}
      className='f-12-500 gap-1.5 rounded-md px-3 py-1.5'
    >
      {isLoggingOut ? <Loader2 size={14} className='animate-spin' /> : <LogOut size={14} />}
      Logout
    </Button>
  );
};

export default SettingsLogoutButton;
