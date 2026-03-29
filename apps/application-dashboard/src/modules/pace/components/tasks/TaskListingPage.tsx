'use client';

import { useCallback, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from 'modules/pace/components/tasks/task-listing.constants';
import TaskAccordionGroup from 'modules/pace/components/tasks/TaskAccordionGroup';
import TaskActionBar from 'modules/pace/components/tasks/TaskActionBar';
import { useDebounce } from '@/hooks';

const TaskListingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='bg-BG_WHITE shrink-0 px-4 py-3'>
        <h1 className='text-GRAY_1000 text-xl leading-normal font-medium'>Tasks</h1>
      </div>

      <TaskActionBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <TaskAccordionGroup search={debouncedSearch || undefined} />
    </div>
  );
};

export default TaskListingPage;
