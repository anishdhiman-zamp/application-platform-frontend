'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { useChat } from '@zamp-platform/chat';
import { ConnectedChatInput, ResourceType, ScopeType } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { usePathname } from 'next/navigation';
import { APITags } from '@/constants/api.constants';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import AutoLoopConfirmDialog from '@/modules/pace/components/chat/AutoLoopConfirmDialog';
import AutoLoopToggle from '@/modules/pace/components/chat/AutoLoopToggle';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { addAutoLoopLockedConversation, isConversationAutoLoopLocked } from '@/modules/pace/utils/autoLoopStorage';
import { baseApi } from '@/services/baseApi';
import type { RootState } from '@/store';
import { selectActiveTabId } from '@/store/slices/dynamic-tabs.slice';

export interface ChatState {
  chat: ReturnType<typeof useChat>;
  isInConversation: boolean;
  showHomeView: boolean;
}

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
  const pathname = usePathname();
  const activeTabId = useAppSelector(selectActiveTabId);
  const dispatch = useAppDispatch();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { chatSidebarState, setChatSidebarState } = usePaceContext();
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });

  const isOnChatRoute = pathname === ROUTES_PATH.CHAT && !activeTabId;

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const { isEnabled: isZampInternalUser } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [autoLoopEnabled, setAutoLoopEnabled] = useState(false);
  const [isAutoLoopLocked, setIsAutoLoopLocked] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  useEffect(() => {
    const locked = isConversationAutoLoopLocked(conversationId);

    setIsAutoLoopLocked(locked);
    setAutoLoopEnabled(locked);
  }, [conversationId]);

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

  const handleChatStateChange = useCallback((state: ChatState) => {
    setChatState(state);
  }, []);

  const handleConversationCreated = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  }, [dispatch]);

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const autoLoopToggleSlot = useMemo(
    () => (
      <AutoLoopToggle
        enabled={autoLoopEnabled}
        onChange={(pressed) => {
          if (pressed) setIsConfirmDialogOpen(true);
        }}
        disabled={isAutoLoopLocked}
      />
    ),
    [autoLoopEnabled, isAutoLoopLocked],
  );

  return (
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
        key={chatKey}
        conversationId={conversationId}
        setConversationId={setConversationId}
        setChatTitle={setChatTitle}
        chatTitle={chatTitle}
        organizationId={organizationId}
        onFileOpen={handleFileOpen}
        onTaskPopoverOpenChange={setIsTaskPopoverOpen}
        isOnChatRoute={isOnChatRoute}
        onChatStateChange={handleChatStateChange}
        fileDropHandlerRef={fileDropHandlerRef}
        addFileReferenceRef={addFileReferenceRef}
        currentUserName={currentUserName}
      />
      {chatState && (
        <div className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3 pb-3'>
          <ConnectedChatInput
            chat={chatState.chat}
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
            autoLoopEnabled={autoLoopEnabled}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            {...(isZampInternalUser && { autoLoopToggleSlot })}
            conversationId={conversationId ?? chatState.chat.conversationId ?? ''}
            onConversationCreated={handleConversationCreated}
            isDisabled={chatState.chat.isStreaming || chatState.chat.isCreatingConversationV2}
            addFileReferenceRef={addFileReferenceRef}
          />
        </div>
      )}
      <AutoLoopConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={() => {
          setAutoLoopEnabled(true);
          setIsAutoLoopLocked(true);
          if (conversationId) {
            addAutoLoopLockedConversation(conversationId);
          }
        }}
      />
    </div>
  );
};

export default ChatSidebarInner;
