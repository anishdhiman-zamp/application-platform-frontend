'use client';

import { useEffect, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { useAppSelector } from '@/hooks/toolkit';
import { getGreeting } from '@/modules/pace/pace.utils';

const ChatHome = () => {
  const user = useAppSelector((state) => state.user.user);
  const userName = user?.user_name ?? '';
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    setGreeting(getGreeting(userName));
  }, [userName]);

  return (
    <div className='flex flex-col items-center gap-y-2.5'>
      <NewPaceIcons width={40} height={40} className='text-GRAY_1000 dark:text-GRAY_950' />
      <h1 className={cn('f-20-500 text-GRAY_1000', greeting ? 'animate-fade-in' : 'opacity-0')}>
        {greeting || 'Hello'}
      </h1>
    </div>
  );
};

export default ChatHome;
