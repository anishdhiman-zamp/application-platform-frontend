'use client';

import { useCallback } from 'react';
import { SearchInput, Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TAB_CONFIG, VALID_TABS } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from '@/modules/pace/components/tasks/types/tasks.types';

interface TaskActionBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TaskActionBar = ({ searchTerm, onSearchChange }: TaskActionBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get('tab');
  const activeTab: TaskListingTab =
    tabParam && VALID_TABS.has(tabParam) ? (tabParam as TaskListingTab) : TASK_LISTING_TAB.ALL;

  const handleTabChange = useCallback(
    (tab: TaskListingTab) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (tab === TASK_LISTING_TAB.ALL) {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }

      const query = params.toString();

      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className='flex flex-col gap-3 pb-2'>
      <div className='flex h-8 w-full items-center gap-1'>
        <SearchInput
          placeholder='Search'
          value={searchTerm}
          onChange={onSearchChange}
          allowClear={false}
          size='small'
          showSearchIcon
          wrapperClassName='w-full min-w-0'
          className='bg-BG_WHITE h-7'
          aria-label='Search tasks'
          testId='task-listing-search-input'
        />
      </div>
      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TaskListingTab)}>
        <TabsList className='h-auto gap-1.5 bg-transparent p-0'>
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'f-12-500 text-GRAY_900 hover:bg-GRAY_100 hover:text-GRAY_1000 h-7 cursor-pointer gap-1.5 rounded-md border-none bg-transparent px-2.5 py-1.5 shadow-none ring-0',
                  'data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 data-[state=active]:shadow-none data-[state=active]:ring-0',
                )}
              >
                <Icon size={13} />
                <span className='whitespace-nowrap'>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TaskActionBar;
