'use client';

import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { useAppSelector } from '@/hooks/toolkit';

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';

  return 'Evening';
};

const MacsChatHome = () => {
  const user = useAppSelector((state) => state.user.user);
  const userName = user?.user_name?.split(' ')[0] || 'there';
  const greeting = getGreeting();

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <NewPaceIcons width={40} height={40} />
        <h1 className='f-16-550 text-GARY_1000'>
          {greeting}, {userName}!
        </h1>
      </div>
    </div>
  );
};

export default MacsChatHome;
