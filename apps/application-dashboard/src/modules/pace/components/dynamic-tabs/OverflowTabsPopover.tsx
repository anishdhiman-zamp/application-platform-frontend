'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { Search, X } from 'lucide-react';
import { getDefaultIcon } from '@/modules/pace/components/dynamic-tabs/dynamic-tabs.utils';
import type { DynamicTab } from '@/modules/pace/pace.types';

interface OverflowTabsPopoverProps {
  overflowTabs: DynamicTab[];
  onTabSelect: (tab: DynamicTab) => void;
  onTabClose: (e: React.MouseEvent, tabId: string) => void;
}

const OverflowTabsPopover = memo(({ overflowTabs, onTabSelect, onTabClose }: OverflowTabsPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTabs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return overflowTabs;

    return overflowTabs.filter((tab) => tab.name.toLowerCase().includes(query));
  }, [overflowTabs, searchQuery]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setSearchQuery('');
    }
  }, []);

  const handleTabSelect = useCallback(
    (tab: DynamicTab) => {
      onTabSelect(tab);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onTabSelect],
  );

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      onTabClose(e, tabId);
    },
    [onTabClose],
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 f-12-500 h-[30px] shrink-0 rounded-[8px] px-2'
        >
          +{overflowTabs.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' sideOffset={6} className='w-[240px] p-0'>
        <div className='border-GRAY_300 border-b p-2'>
          <Input
            size='small'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search'
            icon={<Search size={14} className='text-GRAY_500' />}
            iconPosition='leading'
            className='placeholder:text-GRAY_500 placeholder:f-12-450 f-12-400 h-8 rounded-md bg-white'
            autoFocus
          />
        </div>
        <div className='max-h-[260px] overflow-y-auto p-1 [scrollbar-width:thin]'>
          {filteredTabs.length === 0 ? (
            <p className='f-12-400 text-GRAY_600 px-2 py-3 text-center'>No matching tabs</p>
          ) : (
            filteredTabs.map((tab) => (
              <Button
                key={tab.id}
                variant='ghost'
                onClick={() => handleTabSelect(tab)}
                className='hover:bg-GRAY_100 group flex h-auto w-full items-center justify-start gap-x-2 rounded-md px-2 py-1.5'
              >
                <span className='shrink-0'>{getDefaultIcon(tab)}</span>
                <span className='f-12-500 text-GRAY_900 min-w-0 flex-1 truncate text-left'>{tab.name}</span>
                <span
                  role='button'
                  tabIndex={-1}
                  onClick={(e) => handleTabClose(e, tab.id)}
                  className='text-GRAY_600 hover:text-GRAY_900 hidden shrink-0 items-center justify-center rounded p-0.5 group-hover:flex'
                >
                  <X size={12} />
                </span>
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

OverflowTabsPopover.displayName = 'OverflowTabsPopover';

export default OverflowTabsPopover;
