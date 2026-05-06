'use client';

import { useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageWithTopbar from '@/components/layouts/PageWithTopbar';
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
    <PageWithTopbar
      title='All chats'
      contentClassName='min-h-full max-w-2xl px-4 pt-6 pb-0'
      leading={
        <Button variant='ghost' size='icon' onClick={handleBack} className='h-7 w-7' aria-label='Back to chat'>
          <ArrowLeft size={16} />
        </Button>
      }
    >
      <ChatHistory onSelectConversation={handleSelectConversation} />
    </PageWithTopbar>
  );
};

export default ChatHistoryPage;
