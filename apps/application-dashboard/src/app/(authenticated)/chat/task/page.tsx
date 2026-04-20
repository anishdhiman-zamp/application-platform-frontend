'use client';

import { useSearchParams } from 'next/navigation';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import TaskListingPage from '@/modules/pace/components/tasks/components/TaskListingPage';
import TaskContentInner from '@/modules/pace/module/TaskContentInner';
import { TAB_QUERY_PARAM, TAB_TYPE } from '@/modules/pace/pace.types';

const ChatTasksPage = () => {
  const searchParams = useSearchParams();
  const urlTaskId = searchParams?.get(TAB_QUERY_PARAM.TASK) ?? '';

  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.TASK });

  const taskId = activeTab?.id ?? urlTaskId;

  if (!taskId) {
    return <TaskListingPage />;
  }

  return <TaskContentInner key={taskId} taskId={taskId} />;
};

export default ChatTasksPage;
