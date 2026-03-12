'use client';

import { useEffect, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { ZAMP_ICON } from '@/constants/icons';
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
      <Image width={22} height={22} alt='Zamp logo' className='align-middle' src={ZAMP_ICON} priority />
      <h1 className={cn('f-16-550 text-GRAY_1000', isReady ? 'animate-fade-in' : 'opacity-0')}>
        {greeting || 'Hello'}, {userName || 'there'}
      </h1>
    </div>
  );
};

export default ChatHome;
