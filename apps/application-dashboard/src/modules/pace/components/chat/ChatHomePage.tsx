'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ChatActionsProvider,
  type CreateConversationPayloadTypeV2,
  DropOverlay,
  ResourceType,
  ScopeType,
  useFileDragDrop,
} from '@zamp-platform/chat';
import {
  ConnectedChatInput,
  ConversationActionsContext,
  ConversationStateContext,
  createConversationActions,
  type MentionInsertPayload,
} from '@zamp-platform/conversation-stream';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useVoiceChatContext } from '@/contexts/VoiceChatContext';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import VoiceChatSlot from '@/modules/pace/components/chat/VoiceChatSlot';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useReferencePicker } from '@/modules/pace/hooks/useReferencePicker';
import { NO_ANIMATION } from '@/modules/pace/pace.animations';
import { STUB_CONVERSATION_STATE } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

const ChatHomePage = () => {
  const {
    setChatSidebarState,
    chatSidebarState,
    setChatMessageIntent,
    pendingFileReferences,
    clearPendingFileReferences,
    pendingMentionInserts,
    clearPendingMentionInserts,
    sharedFileReferences,
    setSharedFileReferences,
    sharedExternalFilePaths,
    startNewChat,
    selectConversation,
    selectedModel,
    setSelectedModel,
  } = usePaceContext();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { openTab: openDatasetTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);
  const addMentionRef = useRef<((payload: MentionInsertPayload) => void) | null>(null);

  const { inputValue, setInputValue } = useChatDraftInput({
    conversationId: null,
  });

  const { isVoiceChatEnabled, state: voiceState } = useVoiceChatContext();
  const isVoiceActive = voiceState === VOICE_CHAT_STATE.Active;
  const referencePicker = useReferencePicker();

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: false,
  });

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const handleSelectConversation = useCallback(
    (id: string | null, title?: string) => {
      if (!id) return;

      selectConversation(id, title);
      setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);
    },
    [selectConversation, setChatSidebarState],
  );

  const expandSidebarIfCollapsed = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      expandSidebarIfCollapsed();
      openTab(path, name);
    },
    [openTab, expandSidebarIfCollapsed],
  );

  const handleDatasetOpen = useCallback(
    (datasetId: string, name: string) => {
      expandSidebarIfCollapsed();
      openDatasetTab(datasetId, name);
    },
    [openDatasetTab, expandSidebarIfCollapsed],
  );

  const interceptedActions = useMemo(
    () =>
      createConversationActions({
        createConversationV2: async (payload: CreateConversationPayloadTypeV2) => {
          const fileRefs = payload.message_content?.file_references;

          startNewChat();

          setChatMessageIntent({
            message: payload.message_content?.text || '',
            fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
            references: payload.message_content?.references,
            llmModel: payload.llm_model,
            autoLoopEnabled: payload.pev_enabled,
          });

          setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);

          return { conversation_id: 'pending', message_id: '', status_message: '', title: '' };
        },
      }),
    [startNewChat, setChatMessageIntent, setChatSidebarState],
  );

  const drainPendingMentions = useCallback(() => {
    if (pendingMentionInserts.length === 0 || !addMentionRef.current) return;
    pendingMentionInserts.forEach((payload) => addMentionRef.current?.(payload));
    clearPendingMentionInserts();
  }, [pendingMentionInserts, clearPendingMentionInserts]);

  useEffect(() => {
    if (pendingFileReferences.length > 0 && addFileReferenceRef.current) {
      pendingFileReferences.forEach((ref) => addFileReferenceRef.current?.(ref));
      clearPendingFileReferences();
    }
  }, [pendingFileReferences, clearPendingFileReferences]);

  useEffect(() => {
    drainPendingMentions();
  }, [drainPendingMentions]);

  return (
    <ConversationStateContext.Provider value={STUB_CONVERSATION_STATE}>
      <ConversationActionsContext.Provider value={interceptedActions}>
        <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
          <DropOverlay isVisible={isDragOver} />
          <AnimatePresence>
            {!isExpanded && (
              <ChatActionsProvider onFileOpen={handleFileOpen} onDatasetOpen={handleDatasetOpen}>
                <motion.div
                  key='chat-home-page'
                  initial={false}
                  animate={{ opacity: 1, transition: NO_ANIMATION }}
                  exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
                  className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-start overflow-hidden pt-[22vh]'
                  style={{ willChange: 'opacity' }}
                >
                  <ChatHome />
                  <div className='mt-7 w-full shrink-0 px-3'>
                    <ConnectedChatInput
                      resourceType={ResourceType.ORGANIZATION}
                      resourceId={organizationId}
                      autoFocus
                      scope={ScopeType.ORGANIZATION}
                      scopeId={organizationId}
                      username={username}
                      currentUserName={currentUserName}
                      placeholder="Do your life's best work with Zamp"
                      minTextareaHeight={18}
                      maxTextareaHeight={200}
                      className='shadow-chatbot-shadow'
                      externalInputValue={inputValue}
                      setExternalInputValue={setInputValue}
                      fileDropHandlerRef={fileDropHandlerRef}
                      addFileReferenceRef={addFileReferenceRef}
                      addMentionRef={addMentionRef}
                      externalFileReferences={sharedFileReferences}
                      setExternalFileReferences={setSharedFileReferences}
                      externalFilePathsRef={sharedExternalFilePaths}
                      showModelSelector
                      modelSelectorSlot={modelSelectorSlot}
                      voiceChatSlot={isVoiceChatEnabled ? <VoiceChatSlot /> : null}
                      hideRecordingButton={isVoiceActive}
                      llmModel={selectedModel}
                      referencePicker={referencePicker}
                    />
                  </div>
                  <ChatHistory onSelectConversation={handleSelectConversation} />
                </motion.div>
              </ChatActionsProvider>
            )}
          </AnimatePresence>
        </div>
      </ConversationActionsContext.Provider>
    </ConversationStateContext.Provider>
  );
};

export default ChatHomePage;
