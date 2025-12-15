'use client';

import { Shapes } from 'lucide-react';

const ComponentsSection = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center bg-gray-50 p-8'>
      <Shapes size={48} className='mb-4 text-gray-400' />
      <h2 className='f-18-550 mb-2 text-gray-900'>Components</h2>
      <p className='f-14-450 text-center text-gray-600'>Browse and manage your components here.</p>
    </div>
  );
};

export default ComponentsSection;
