'use client';

import { useCallback } from 'react';
import { type TaskBreadcrumb } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getChatTaskRoute } from '@/constants/routeConfig';
import { markNavAsSubtask } from '@/modules/pace/hooks/useTabRouter';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';

interface BackToParentButtonProps {
  parent: TaskBreadcrumb;
  ancestorsAbove: TaskBreadcrumb[];
}

const BackToParentButton = ({ parent, ancestorsAbove }: BackToParentButtonProps) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    const route = getChatTaskRoute({
      taskId: parent?.id,
      conversationId: parent?.conversationId,
      taskTitle: parent?.title,
      status: parent?.status,
      currentIndex: parent?.currentIndex,
      totalRows: parent?.totalRows,
      parentTasks: ancestorsAbove?.length > 0 ? ancestorsAbove : undefined,
      inChat: true,
    });

    markNavAsSubtask(parent?.id);
    router.push(preserveSidebarParam(route));
  }, [router, parent, ancestorsAbove]);

  return (
    <div className='flex shrink-0 items-center gap-x-1 px-3 pt-2'>
      <Button
        variant='ghost'
        onClick={handleClick}
        className='text-GRAY_700 hover:text-GRAY_900 hover:bg-accent f-13-500 h-8 gap-x-1.5 rounded-lg px-2'
        aria-label='Back'
      >
        <ArrowLeft size={16} />
        Back
      </Button>
    </div>
  );
};

export default BackToParentButton;
