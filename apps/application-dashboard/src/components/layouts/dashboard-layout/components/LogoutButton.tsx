'use client';

import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { Loader2, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

const LogoutButton: FC = () => {
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className='border-GRAY_400 mt-0.5 border-t pt-0.5'>
      <Button
        variant='ghost'
        onClick={logout}
        disabled={isLoggingOut}
        className='text-GRAY_700 hover:bg-GRAY_100 h-auto w-full justify-start gap-2 rounded-md p-1'
      >
        <div className='flex h-6 w-6 items-center justify-center'>
          <LogOut width={14} height={14} />
        </div>
        <div className='f-12-450 flex-1 text-left'>Logout</div>
        {isLoggingOut && <Loader2 className='h-4 w-4 animate-spin' />}
      </Button>
    </div>
  );
};

export default LogoutButton;
