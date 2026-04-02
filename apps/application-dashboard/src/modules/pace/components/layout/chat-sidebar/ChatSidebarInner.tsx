'use client';

import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { ResourceType, ScopeType } from '@zamp-platform/chat';
import { ConnectedChatInput, ConversationProvider } from '@zamp-platform/conversation-stream';
import { cn } from '@zamp-platform/ui/utils';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { useAppSelector } from '@/hooks/toolkit';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

interface ChatSidebarInnerProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  startNewChat: () => void;
  chatTitle: string;
  chatKey: number;
}

const ChatSidebarInner: FC<ChatSidebarInnerProps> = ({
  conversationId,
  setConversationId,
  setChatTitle,
  startNewChat,
  chatTitle,
  chatKey,
}) => {
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { chatSidebarState, setChatSidebarState } = usePaceContext();
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const handleExpand = useCallback(() => {
    setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);
  }, [setChatSidebarState]);

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      openTab(path, name);
    },
    [openTab, chatSidebarState, setChatSidebarState],
  );

  const handleTaskOpen = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleConversationIdChange = useCallback(
    (id: string | null) => {
      if (id && id !== conversationId) {
        setConversationId(id, chatTitle);
      }
    },
    [setConversationId, chatTitle, conversationId],
  );

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  return (
    <ConversationProvider
      key={chatKey}
      conversationId={conversationId}
      resourceId={organizationId}
      resourceType={ResourceType.ORGANIZATION}
      enableStreaming
      usePerConversationSSE
      setHeader={(header: string) => {
        if (!chatTitle) {
          setChatTitle(header);
        }
      }}
      onConversationIdChange={handleConversationIdChange}
    >
      <div className='bg-BG_WHITE relative mx-auto flex h-full w-full flex-1 flex-col'>
        <div className={cn('transition-[filter] duration-200', isTaskPopoverOpen && 'pointer-events-none blur-sm')}>
          <ChatTopbar
            title={chatTitle || 'Start a new chat'}
            conversationId={conversationId}
            organizationId={organizationId}
            onStartNewChat={startNewChat}
            onTitleChange={setChatTitle}
            onSelectConversation={setConversationId}
            onExpand={chatSidebarState !== CHAT_SIDEBAR_STATE.EXPANDED ? handleExpand : undefined}
          />
        </div>

        <ChatConversationContent
          conversationId={conversationId}
          organizationId={organizationId}
          onFileOpen={handleFileOpen}
          onTaskOpen={handleTaskOpen}
          onTaskPopoverOpenChange={setIsTaskPopoverOpen}
          fileDropHandlerRef={fileDropHandlerRef}
          addFileReferenceRef={addFileReferenceRef}
          currentUserName={currentUserName}
        />

        <div className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3 pb-3'>
          <ConnectedChatInput
            resourceType={ResourceType.ORGANIZATION}
            resourceId={organizationId}
            autoFocus
            scope={ScopeType.ORGANIZATION}
            scopeId={organizationId}
            username={username}
            currentUserName={currentUserName}
            placeholder="Do your life's best work with Pace"
            externalInputValue={inputValue}
            setExternalInputValue={setInputValue}
            fileDropHandlerRef={fileDropHandlerRef}
            llmModel={selectedModel}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            conversationId={conversationId ?? ''}
            isDisabled={false}
            addFileReferenceRef={addFileReferenceRef}
          />
        </div>
      </div>
    </ConversationProvider>
  );
};

export default ChatSidebarInner;
