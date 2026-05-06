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
    <div className='border-GRAY_400 bg-BG_WHITE flex h-[54px] shrink-0 items-center gap-5 overflow-hidden border-b px-4'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => handleTabChange(value as TaskListingTab)}
        className='min-w-0 shrink overflow-hidden'
      >
        <TabsList className='h-[54px] max-w-full justify-start gap-5 overflow-x-auto bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'f-13-500 text-GRAY_700 hover:text-GRAY_1000 relative h-[54px] cursor-pointer gap-1.5 rounded-none border-none bg-transparent px-1.5 py-0 shadow-none ring-0 transition-colors hover:bg-transparent',
                  'after:absolute after:right-1.5 after:bottom-0 after:left-1.5 after:h-0.5 after:bg-transparent after:content-[""]',
                  'data-[state=active]:text-GRAY_1000 data-[state=active]:after:bg-GRAY_1000 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0',
                )}
              >
                <Icon size={14} />
                <span className='whitespace-nowrap'>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <SearchInput
        placeholder='Search'
        value={searchTerm}
        onChange={onSearchChange}
        allowClear={false}
        size='small'
        showSearchIcon
        wrapperClassName='w-24 shrink-0 min-[420px]:w-40 sm:w-56'
        className='bg-BG_WHITE h-8'
        aria-label='Search tasks'
        testId='task-listing-search-input'
      />
    </div>
  );
};

export default TaskActionBar;
