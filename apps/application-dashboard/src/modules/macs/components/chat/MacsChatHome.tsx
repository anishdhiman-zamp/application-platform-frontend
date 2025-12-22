'use client';

import { useEffect, useState } from 'react';
import { getGreeting } from 'modules/macs/utils/utils';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { useAppSelector } from '@/hooks/toolkit';

const MacsChatHome = () => {
  const user = useAppSelector((state) => state.user.user);
  const userName = user?.user_name?.split(' ')[0] || 'there';
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    // Only calculate greeting on the client side after hydration
    setGreeting(getGreeting());
  }, []);

  return (
    <div className='mt-[116px] flex w-full flex-col items-center'>
      <div className='flex flex-col items-center gap-4'>
        <NewPaceIcons width={40} height={40} />
        <h1 className='f-16-550 text-GRAY_1000'>
          {greeting || 'Hello'}, {userName}!
        </h1>
      </div>
    </div>
  );
};

export default MacsChatHome;
