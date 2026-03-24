'use client';

import { useCallback, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from 'modules/pace/components/tasks/task-listing.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';
import TaskAccordionGroup from 'modules/pace/components/tasks/TaskAccordionGroup';
import TaskActionBar from 'modules/pace/components/tasks/TaskActionBar';
import { useDebounce } from '@/hooks';

const TaskListingPage = () => {
  const [activeTab, setActiveTab] = useState<TaskListingTab>(TASK_LISTING_TAB.ALL);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  const handleTabChange = useCallback((tab: TaskListingTab) => {
    setActiveTab(tab);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='bg-BG_WHITE shrink-0 px-4 py-3'>
        <h1 className='text-GRAY_1000 text-xl leading-normal font-medium'>Tasks</h1>
      </div>

      <TaskActionBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <TaskAccordionGroup activeTab={activeTab} search={debouncedSearch || undefined} />
    </div>
  );
};

export default TaskListingPage;
