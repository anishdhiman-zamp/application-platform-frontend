import React from 'react';
import Preferences from '@/modules/general/components/Preferences';
import Profile from '@/modules/general/components/Profile';

const GeneralPage = () => {
  return (
    <div className='bg-BG_WHITE h-full w-full overflow-auto p-10'>
      <div className='flex h-full w-full flex-col'>
        <Profile />
        <Preferences />
      </div>
    </div>
  );
};

export default GeneralPage;
