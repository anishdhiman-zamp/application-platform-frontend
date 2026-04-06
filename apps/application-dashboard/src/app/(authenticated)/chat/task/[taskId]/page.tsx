'use client';

import { useParams } from 'next/navigation';
import TaskContentInner from '@/modules/pace/components/chat/TaskContentInner';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const ChatTaskPage = () => {
  const params = useParams();
  const urlTaskId = (params?.taskId as string) ?? '';

  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.TASK });

  const taskId = activeTab?.id ?? urlTaskId;

  return <TaskContentInner key={taskId} taskId={taskId} />;
};

export default ChatTaskPage;
