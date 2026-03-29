'use client';

import TaskContentInner from '@/modules/pace/components/chat/TaskContentInner';
import { useSyncedPathname } from '@/modules/pace/hooks/useSyncedSearchParam';
import { usePathname } from 'next/navigation';

const ChatTaskPage = () => {
  const pathname = usePathname();
  const taskId = decodeURIComponent(pathname?.split('/').pop() ?? '') ?? '';

  console.log('taskId', taskId, pathname);

  return <TaskContentInner key={taskId} taskId={taskId} />;
};

export default ChatTaskPage;
