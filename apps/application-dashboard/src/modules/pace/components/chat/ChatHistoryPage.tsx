'use client';

import { useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';

const ChatHistoryPage = () => {
  const router = useRouter();

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      if (!id) return;
      router.push(`/chat?${SIDEBAR_CONVERSATION_ID_PARAM}=${id}`);
    },
    [router],
  );

  const handleBack = useCallback(() => {
    router.push('/chat');
  }, [router]);

  return (
    <div className='bg-BG_WHITE flex h-full w-full justify-center overflow-hidden'>
      <div className='flex h-full w-full max-w-2xl flex-col px-4 pt-6'>
        <div className='mb-2 flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={handleBack} className='h-7 w-7' aria-label='Back to chat'>
            <ArrowLeft size={16} />
          </Button>
          <h1 className='text-GRAY_900 text-lg font-semibold'>All chats</h1>
        </div>
        <ChatHistory onSelectConversation={handleSelectConversation} />
      </div>
    </div>
  );
};

export default ChatHistoryPage;
