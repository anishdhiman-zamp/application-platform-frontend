'use client';

import type { FC } from 'react';
import { Input } from '@zamp-platform/ui';
import McpConnectionDialog from 'modules/integrations/components/McpConnectionDialog';

interface IntegrationHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className='flex flex-col items-start gap-y-4 px-10'>
      <span className='f-20-600 text-GRAY_1000'>Integrations</span>

      <div className='flex w-full items-center justify-between'>
        <Input
          placeholder='Search'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='border-GRAY_400 focus:border-GRAY_600 w-[300px] focus:ring-3'
          size='small'
        />

        {/* MCP Connection Dialog */}
        <McpConnectionDialog />
      </div>
    </div>
  );
};

export default IntegrationHeader;
