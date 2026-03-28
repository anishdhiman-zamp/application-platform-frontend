'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  ConnectedChatInput,
  CreateConversationPayloadTypeV2,
  DropOverlay,
  ResourceType,
  ScopeType,
  useChat,
  useFileDragDrop,
} from '@zamp-platform/chat';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

const ChatHomePage: FC = () => {
  const {
    setChatSidebarState,
    chatSidebarState,
    setPendingConversationPayload,
    pendingFileReference,
    clearPendingFileReference,
  } = usePaceContext();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    enableStreaming: true,
  });

  const interceptedChat = useMemo(() => {
    return {
      ...chat,
      createConversationV2: async (payload: CreateConversationPayloadTypeV2) => {
        const fileRefs = payload.message_content?.file_references;

        setPendingConversationPayload({
          message: payload.message_content?.text || '',
          fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
          llmModel: payload.llm_model,
        });

        setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);

        return { conversation_id: 'pending', status_message: '', title: '' };
      },
    };
  }, [chat, setPendingConversationPayload, setChatSidebarState]);

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      if (!id) return;

      const params = new URLSearchParams(window.location.search);

      params.set(SIDEBAR_CONVERSATION_ID_PARAM, id);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);

      setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);
    },
    [setChatSidebarState],
  );

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference]);

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;

  if (isExpanded) {
    return null;
  }

  return (
    <ChatActionsProvider>
      <div
        className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-start overflow-hidden pt-[15vh]'
        {...dropZoneProps}
      >
        <DropOverlay isVisible={isDragOver} />
        <ChatHome />
        <div className='mt-7 w-full shrink-0 px-3'>
          <ConnectedChatInput
            chat={interceptedChat}
            resourceType={ResourceType.ORGANIZATION}
            resourceId={organizationId}
            autoFocus
            scope={ScopeType.ORGANIZATION}
            scopeId={organizationId}
            username={username}
            currentUserName={currentUserName}
            placeholder="Do your life's best work with Pace"
            conversationId={chat.conversationId ?? ''}
            minTextareaHeight={18}
            maxTextareaHeight={200}
            className='shadow-chatbot-shadow'
            fileDropHandlerRef={fileDropHandlerRef}
            addFileReferenceRef={addFileReferenceRef}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            llmModel={selectedModel}
          />
        </div>
        <ChatHistory onSelectConversation={handleSelectConversation} />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatHomePage;
