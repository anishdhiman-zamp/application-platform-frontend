'use client';

import { useCallback, useState } from 'react';
import { Button, SearchInput, Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { Search, X } from 'lucide-react';
import { TAB_CONFIG } from 'modules/pace/components/tasks/task-listing.constants';
import type { TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';

interface TaskActionBarProps {
  activeTab: TaskListingTab;
  onTabChange: (tab: TaskListingTab) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TaskActionBar = ({ activeTab, onTabChange, searchTerm, onSearchChange }: TaskActionBarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) onSearchChange('');

      return !prev;
    });
  }, [onSearchChange]);

  return (
    <div className='border-GRAY_400 flex h-[47px] items-end justify-between overflow-hidden border-b pl-4'>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TaskListingTab)}>
        <TabsList className='h-auto gap-8 bg-transparent p-0'>
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className='f-12-500 text-GRAY_700 data-[state=active]:text-GRAY_1000 group relative h-7 gap-1.5 rounded-none border-none bg-transparent px-1 pt-0 pb-2 shadow-none ring-0 hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0'
              >
                <Icon size={14} />
                <span className='whitespace-nowrap'>{tab.label}</span>
                <div className='bg-GRAY_1000 absolute bottom-0 left-0 hidden h-[2.5px] w-full group-data-[state=active]:block' />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className='flex h-full items-center gap-1.5 p-4'>
        {isSearchOpen && (
          <SearchInput
            placeholder='Search tasks...'
            value={searchTerm}
            onChange={onSearchChange}
            size='small'
            autoFocus
            className='bg-BG_WHITE h-7 w-56'
            testId='task-listing-search-input'
          />
        )}
        <Button
          variant='ghost'
          size='icon'
          onClick={handleToggleSearch}
          className='h-[22px] w-[22px] shrink-0'
          testId='task-listing-search-toggle'
        >
          {isSearchOpen ? <X size={14} className='text-GRAY_700' /> : <Search size={14} className='text-GRAY_700' />}
        </Button>
      </div>
    </div>
  );
};

export default TaskActionBar;
