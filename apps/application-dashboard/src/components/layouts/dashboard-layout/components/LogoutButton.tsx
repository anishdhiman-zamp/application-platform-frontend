'use client';

import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Loader2, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

const LogoutButton: FC = () => {
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className='border-GRAY_400 mt-0.5 border-t pt-0.5' onClick={logout}>
      <div
        className={cn('text-GRAY_700 hover:bg-GRAY_100 flex cursor-pointer items-center gap-2 rounded-md p-1', {
          'cursor-not-allowed': isLoggingOut,
        })}
      >
        <div className='flex h-6 w-6 items-center justify-center'>
          <LogOut width={14} height={14} />
        </div>
        <div className='f-12-450 flex-1'>Logout</div>
        {isLoggingOut && <Loader2 className='w-4 animate-spin' />}
      </div>
    </div>
  );
};

export default LogoutButton;
