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
import { AnimatePresence, motion } from 'framer-motion';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useAppSelector } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import AutoLoopConfirmDialog from '@/modules/pace/components/chat/AutoLoopConfirmDialog';
import AutoLoopToggle from '@/modules/pace/components/chat/AutoLoopToggle';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { NO_ANIMATION } from '@/modules/pace/pace.animations';
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
    startNewChat,
    selectConversation,
  } = usePaceContext();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const { isEnabled: isZampInternalUser } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [pevEnabled, setPevEnabled] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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

        startNewChat();

        setPendingConversationPayload({
          message: payload.message_content?.text || '',
          fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
          llmModel: payload.llm_model,
          pevEnabled: payload.pev_enabled,
        });

        setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);

        return { conversation_id: 'pending', status_message: '', title: '' };
      },
    };
  }, [chat, startNewChat, setPendingConversationPayload, setChatSidebarState]);

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      if (!id) return;

      selectConversation(id);
      setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);
    },
    [selectConversation, setChatSidebarState],
  );

  const handleAutoLoopToggle = useCallback((pressed: boolean) => {
    if (pressed) {
      setIsConfirmDialogOpen(true);
    }
  }, []);

  const handleAutoLoopConfirm = useCallback(() => {
    setPevEnabled(true);
    // No localStorage lock here — conversationId doesn't exist yet.
    // Lock is applied in ChatConversationContent when the conversation is created.
  }, []);

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const autoLoopToggleSlot = useMemo(
    () =>
      isZampInternalUser ? (
        <AutoLoopToggle enabled={pevEnabled} onChange={handleAutoLoopToggle} disabled={pevEnabled} />
      ) : undefined,
    [pevEnabled, isZampInternalUser, handleAutoLoopToggle],
  );

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference]);

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <ChatActionsProvider>
            <motion.div
              key='chat-home-page'
              initial={false}
              animate={{ opacity: 1, transition: NO_ANIMATION }}
              exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
              className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-start overflow-hidden pt-[22vh]'
              style={{ willChange: 'opacity' }}
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
                  leftSlot={autoLoopToggleSlot}
                  llmModel={selectedModel}
                  pevEnabled={pevEnabled}
                />
              </div>
              <ChatHistory onSelectConversation={handleSelectConversation} />
            </motion.div>
          </ChatActionsProvider>
        )}
      </AnimatePresence>
      <AutoLoopConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleAutoLoopConfirm}
      />
    </>
  );
};

export default ChatHomePage;
