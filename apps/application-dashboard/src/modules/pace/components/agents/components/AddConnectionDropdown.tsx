'use client';

import { useState } from 'react';
import { Button, Checkbox, Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import type { AgentConnectionType } from 'modules/pace/components/agents/types/agents.types';
import { getNameInitial } from '@/utils/common';

interface AddConnectionDropdownProps {
  integrationIcon: string;
  integrationLogo?: string;
  integrationName: string;
  connections: AgentConnectionType[];
  allConnections?: AgentConnectionType[];
  onToggleConnection?: (connectionId: string, checked: boolean) => void;
}

const AddConnectionDropdown = ({
  integrationLogo,
  integrationName,
  connections,
  allConnections,
  onToggleConnection,
}: AddConnectionDropdownProps) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Active connections = those currently in the right panel
  const activeIds = new Set(connections.map((c) => c.id));

  // Show ALL connections (including unchecked), not just active ones
  const displayConnections = allConnections ?? connections;
  const filtered = displayConnections.filter((c) => c.email.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (id: string) => {
    const wasChecked = activeIds.has(id);

    onToggleConnection?.(id, !wasChecked);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSearch('');
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='text-GRAY_700 size-6' onClick={(e) => e.stopPropagation()}>
          <Plus size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='bg-BG_WHITE border-GRAY_300 w-[220px] p-0 shadow-sm' align='center' sideOffset={4}>
        <div className='flex flex-col'>
          <div className='px-3 pt-3 pb-1'>
            <Input
              placeholder='Search'
              size='small'
              className='bg-BG_WHITE h-7 w-full'
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <div className='flex max-h-[200px] flex-col overflow-y-auto px-1 pb-1'>
            {filtered.map((connection) => {
              const isChecked = activeIds.has(connection.id);

              return (
                <div
                  role='button'
                  key={connection.id}
                  className='hover:bg-GRAY_50 flex cursor-pointer items-center gap-2 rounded-md p-2 text-left'
                  onClick={() => handleToggle(connection.id)}
                >
                  <Checkbox checked={isChecked} tabIndex={-1} />
                  <div className='flex shrink-0 items-center justify-center overflow-hidden rounded-[2.5px]'>
                    {imgError || !integrationLogo ? (
                      <div className='bg-GRAY_200 text-GRAY_700 flex h-full w-full items-center justify-center rounded text-[10px] font-medium'>
                        {getNameInitial(integrationName)}
                      </div>
                    ) : (
                      <img
                        src={integrationLogo}
                        alt={integrationName}
                        className='h-3.5 w-3.5 object-contain'
                        onError={() => setImgError(true)}
                      />
                    )}
                  </div>
                  <span className='f-13-500 text-GRAY_1000 truncate'>{connection.email}</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className='text-GRAY_700 px-2 py-3 text-center text-xs'>No connections found</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddConnectionDropdown;
