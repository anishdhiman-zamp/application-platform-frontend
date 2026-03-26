'use client';

import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Loader2, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

interface LogoutButtonProps {
  className?: string;
  macs?: boolean;
}

const LogoutButton: FC<LogoutButtonProps> = ({ className, macs = false }) => {
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className={cn('border-GRAY_400 mt-0.5 border-t pt-0.5', className)}>
      <Button
        variant='ghost'
        onClick={logout}
        size='large'
        disabled={isLoggingOut}
        leadingIcon={<LogOut width={14} height={14} />}
        className={cn(
          'hover:bg-GRAY_100 h-8 w-full justify-start rounded-md p-1',
          macs ? 'text-GRAY_900 gap-3.5' : 'text-GRAY_700 gap-2',
        )}
      >
        <div className='flex w-full items-center gap-2'>
          <div className='f-12-450 flex-1 text-left select-none'>Logout</div>
          {isLoggingOut && <Loader2 className='h-4 w-4 animate-spin' />}
        </div>
      </Button>
    </div>
  );
};

export default LogoutButton;
