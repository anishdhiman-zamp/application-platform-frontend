'use client';

import { FileText } from 'lucide-react';
import type { Tab } from '@/modules/macs/types';

interface GenericSectionProps {
  tab: Tab;
}

const GenericSection = ({ tab }: GenericSectionProps) => {
  return (
    <div className='flex h-full flex-col items-center justify-center bg-gray-50 p-8'>
      <FileText size={48} className='mb-4 text-gray-400' />
      <h2 className='f-18-550 mb-2 text-gray-900'>{tab.title}</h2>
      <p className='f-14-450 text-center text-gray-600'>
        Content for {tab.type}: {tab.title}
      </p>
    </div>
  );
};

export default GenericSection;
