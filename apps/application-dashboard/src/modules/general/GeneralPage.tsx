import React from 'react';
import Preferences from '@/modules/general/components/Preferences';
import Profile from '@/modules/general/components/Profile';

const GeneralPage = () => {
  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-auto'>
      <div className='flex w-full flex-col gap-6'>
        <Profile />
        <Preferences />
      </div>
    </div>
  );
};

export default GeneralPage;
