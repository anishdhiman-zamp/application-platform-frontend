'use client';

import { Puzzle } from 'lucide-react';

const CapabilitiesSection = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center bg-white p-8'>
      <Puzzle size={48} className='mb-4 text-gray-400' />
      <h2 className='f-18-550 mb-2 text-gray-900'>Capabilities</h2>
      <p className='f-14-450 text-center text-gray-600'>Explore and manage your capabilities here.</p>
    </div>
  );
};

export default CapabilitiesSection;
