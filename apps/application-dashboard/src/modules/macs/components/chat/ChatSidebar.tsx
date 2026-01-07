'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import {
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatTopbar from '@/modules/macs/components/chat/ChatTopbar';
import { ChatMessagesSkeleton } from '@/modules/macs/components/loaders';
import { useChatContext } from '@/modules/macs/context/ChatContext';
import type { RootState } from '@/store';

interface ChatSidebarProps {
  className?: string;
}

interface ChatSidebarInnerProps {
  sidebarKey?: number;
  onStartNewChat?: () => void;
}

const ChatSidebarInner: FC<ChatSidebarInnerProps> = () => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const { setChatTitle } = useChatContext();
  const [conversationId, setConversationId] = useState<string | null>(null);

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: conversationId ?? undefined,
    enableStreaming: true,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V3,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V3,
    },
    setHeader: (header: string) => {
      setChatTitle(header);
    },
  });

  const hasMessages = useMemo(() => chat.messages.length > 0, [chat.messages]);

  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);

  const isLoadingConversation = Boolean(
    chat.conversationId &&
      !hasMessages &&
      (chat.isLoadingConversationHistory || chat.isUninitializedConversationHistory),
  );

  useEffect(() => {
    if (chat.conversationId && !conversationId) {
      setConversationId(chat.conversationId);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {hasMessages ? (
        <CommonWrapper
          isLoading={isLoadingConversation}
          isError={chat.isErrorConversationHistory}
          refetchFunction={chat.refetchConversationHistory}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<ChatMessagesSkeleton />}
          className='flex min-h-0 flex-1'
        >
          <MessageContainer
            messages={chat.messages}
            isAnalysing={isAnalysing}
            streamingState={chat.streamingState}
            className='px-3 [scrollbar-width:none]'
            assistantAvatar={<NewPaceAvatar />}
            streamingEnabled
          />
        </CommonWrapper>
      ) : (
        <div className='flex flex-1 items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <NewPaceIcons width={40} height={40} />
            <p className='f-13-400 text-GRAY_600'>Start a new conversation</p>
          </div>
        </div>
      )}
      <div className='border-GRAY_400 w-full flex-shrink-0 border-t p-3'>
        <ConnectedChatInput
          chat={chat}
          conversationId={chat.conversationId ?? ''}
          resourceType={ResourceType.ORGANIZATION}
          resourceId={organizationId}
          scope={ScopeType.ORGANIZATION}
          scopeId={organizationId}
          organizationId={organizationId}
          currentUserName={currentUserName}
          isDisabled={chat.isStreaming || chat.isCreatingConversationV2}
          placeholder="Do your life's best work with Pace"
          className={chat.isCreatingConversationV2 ? 'animate-pulse rounded-xl bg-gray-50' : ''}
        />
      </div>
    </div>
  );
};

const ChatSidebar = ({ className }: ChatSidebarProps) => {
  const { isChatSidebarOpen, setIsChatSidebarOpen, setChatTitle } = useChatContext();
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleStartNewChat = () => {
    setSidebarKey((prev) => prev + 1);
    setChatTitle('Chat');
  };

  const handleClose = () => {
    setIsChatSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {isChatSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'border-GRAY_400 flex h-full flex-shrink-0 flex-col overflow-hidden border-r bg-white',
            className,
          )}
        >
          <ChatTopbar onStartNewChat={handleStartNewChat} onClose={handleClose} className='border-none' />
          <ChatSidebarInner key={sidebarKey} sidebarKey={sidebarKey} onStartNewChat={handleStartNewChat} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
