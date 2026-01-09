'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import MacsTopbar from '@/modules/pace/components/MacsTopbar';
import { useMacsContext } from '@/modules/pace/context/MacsContext';
import { ViewMode } from '@/modules/pace/types';

const ChatIdLayout = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const chatId = params?.chatId as string;
  const { showHistory, setShowHistory, setChatTitle, viewMode } = useMacsContext();

  const isDefaultView = viewMode === ViewMode.Default;

  useEffect(() => {
    setShowHistory(false);
    setChatTitle('');
  }, [chatId, setShowHistory]);

  return (
    <div className='flex h-full w-full flex-col'>
      {isDefaultView && <MacsTopbar />}
      <div className='flex w-full flex-shrink-0 items-center justify-center'>
        <ChatTopbar className='w-[700px]' />
      </div>
      <div className='min-h-0 flex-1'>
        {showHistory ? (
          <div className='mx-auto flex h-full w-full max-w-[700px] flex-col'>
            <ChatHistory />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChatIdLayout;
