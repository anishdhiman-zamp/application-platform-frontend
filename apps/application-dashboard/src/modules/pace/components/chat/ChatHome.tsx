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
  const isReady = greeting && userName;

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className='flex flex-col items-center gap-3'>
      <NewPaceIcons width={40} height={40} className='text-GRAY_1000 dark:text-GRAY_950' />
      <h1 className={cn('f-16-550 text-GRAY_1000', isReady ? 'animate-fade-in' : 'opacity-0')}>
        {greeting || 'Hello'}, {userName || 'there'}
      </h1>
    </div>
  );
};

export default ChatHome;
