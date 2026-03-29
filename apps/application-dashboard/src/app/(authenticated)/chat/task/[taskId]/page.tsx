'use client';

import TaskContentInner from '@/modules/pace/components/chat/TaskContentInner';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const ChatTaskPage = () => {
  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.TASK });
  const taskId = activeTab?.id ?? '';

  return <TaskContentInner key={taskId} taskId={taskId} />;
};

export default ChatTaskPage;
