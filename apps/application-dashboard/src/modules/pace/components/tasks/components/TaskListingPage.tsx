'use client';

import { useCallback, useMemo, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layouts/PageContainer';
import PageTitleBar from '@/components/layouts/PageTitleBar';
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
    <PageContainer className='min-h-full'>
      <PageTitleBar title='Tasks' />

      <TaskActionBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <TaskAccordionGroup search={debouncedSearch || undefined} creationSource={creationSource} />
    </PageContainer>
  );
};

export default TaskListingPage;
