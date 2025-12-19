'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/toolkit';
import KnowledgeBaseChat from '@/modules/process/knowledge-base-creation/KnowledgeBaseChat';
import ProcessCreationKnowledgeBase from '@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';

const CreateKnowledgebasePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(closeSidebar());
    }, 300);

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  return (
    <div className='flex h-full w-full'>
      <div className='border-GRAY_400 h-full w-[444px] min-w-[444px] border-r'>
        <KnowledgeBaseChat />
      </div>
      <div className='w-full'>
        <ProcessCreationKnowledgeBase />
      </div>
    </div>
  );
};

export default CreateKnowledgebasePage;
