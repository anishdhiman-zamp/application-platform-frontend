'use client';

import { useEffect, useState } from 'react';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { useAppSelector } from '@/hooks/toolkit';
import { getGreeting } from '@/modules/macs/macs.utils';

const ChatHome = () => {
  const user = useAppSelector((state) => state.user.user);
  const userName = user?.user_name?.split(' ')[0];
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    // Only calculate greeting on the client side after hydration
    setGreeting(getGreeting());
  }, []);

  const isReady = greeting && userName;

  return (
    <div className='mt-[116px] flex w-full flex-col items-center'>
      <div className='flex flex-col items-center gap-4'>
        <NewPaceIcons width={40} height={40} />
        <h1 className={`f-16-550 text-GRAY_1000 ${isReady ? 'animate-fade-in' : 'opacity-0'}`}>
          {greeting || 'Hello'}, {userName || 'there'}
        </h1>
      </div>
    </div>
  );
};

export default ChatHome;
