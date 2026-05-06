'use client';

import { useCallback, useMemo, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks';
import TaskAccordionGroup from '@/modules/pace/components/tasks/components/TaskAccordionGroup';
import TaskActionBar from '@/modules/pace/components/tasks/components/TaskActionBar';
import { SEARCH_DEBOUNCE_MS } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { CREATION_SOURCE_TYPE, type CreationSource } from '@/modules/pace/components/tasks/types/tasks.types';

const TaskListingPage = () => {
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  const creationSource: CreationSource | undefined = useMemo(
    () => (conversationId ? { type: CREATION_SOURCE_TYPE.CONVERSATION, id: conversationId } : undefined),
    [conversationId],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return (
    <div className='bg-BG_WHITE flex h-full min-h-0 w-full flex-col overflow-hidden'>
      <div className='border-GRAY_400 flex h-[54px] shrink-0 items-center border-b px-3'>
        <h1 className='f-14-550 text-GRAY_1000 min-w-0 truncate'>Tasks</h1>
      </div>
      <TaskActionBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <TaskAccordionGroup search={debouncedSearch || undefined} creationSource={creationSource} fullPage />
      </div>
    </div>
  );
};

export default TaskListingPage;
