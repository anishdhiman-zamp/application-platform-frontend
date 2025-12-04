'use client';

import type { FC } from 'react';
import { Input } from '@zamp-platform/ui';

interface IntegrationHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className='flex flex-col items-start gap-y-4 px-10'>
      <span className='f-20-600 text-GRAY_1000'>Integrations</span>

      <Input
        placeholder='Search'
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className='border-GRAY_400 focus:border-GRAY_600 w-[300px] focus:ring-3'
        size='small'
      />
    </div>
  );
};

export default IntegrationHeader;
