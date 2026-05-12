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
  ConversationBrowserContext,
  ConversationInputContext,
  ConversationMessagesContext,
  ConversationStateContext,
  ConversationStatusContext,
  createConversationActions,
  type FocusEditorRef,
  type MentionInsertPayload,
} from '@zamp-platform/conversation-stream';
import { VOICE_CHAT_STATE } from '@zamp-platform/ui/types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getChatTaskRoute, ROUTES_PATH } from '@/constants/routeConfig';
import { useVoiceChatContext } from '@/contexts/VoiceChatContext';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import VoiceChatSlot from '@/modules/pace/components/chat/VoiceChatSlot';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import FilePill from '@/modules/pace/components/files/FilePill';
import { shouldUseSingleViewerMode } from '@/modules/pace/components/files-panel/files-panel.utils';
import { CHAT_DRAFT_UPDATE_EVENT, useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useReferencePicker } from '@/modules/pace/hooks/useReferencePicker';
import { NO_ANIMATION } from '@/modules/pace/pace.animations';
import { SINGLE_VIEWER_TAB_METADATA_KEY, STUB_CONVERSATION_STATE } from '@/modules/pace/pace.constants';
import { usePaceActionsContext, usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import type { RootState } from '@/store';

const ChatHomePage = () => {
  const { setChatSidebarState, chatSidebarState } = usePaceLayoutContext();
  const {
    setChatMessageIntent,
    pendingFileReferences,
    clearPendingFileReferences,
    pendingMentionInserts,
    clearPendingMentionInserts,
    sharedFileReferences,
    setSharedFileReferences,
    sharedExternalFilePaths,
    selectedModel,
    setSelectedModel,
    activeAgentInfo,
    activeFileInfo,
    setActiveFileInfo,
  } = usePaceConversationContext();
  const { startNewChat, chatInputFocusRequestKey } = usePaceActionsContext();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';
  const { activeTab } = useDynamicTabs();
  const { openTab, openSingleTab: openSingleFileTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { openTab: openDatasetTab, openSingleTab: openSingleDatasetTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });
  const { openTab: openTaskTab, openSingleTab: openSingleTaskTab } = useDynamicTabs({ type: TAB_TYPE.TASK });

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);
  const addMentionRef = useRef<((payload: MentionInsertPayload) => void) | null>(null);
  const focusEditorRef: FocusEditorRef = useRef<(() => void) | null>(null);
  const pendingDraftFocusRef = useRef(false);
  const didFocusHydratedDraftRef = useRef(false);
  const pathname = usePathname();

  const { inputValue, setInputValue } = useChatDraftInput({
    conversationId: null,
  });

  const { isVoiceChatEnabled, state: voiceState } = useVoiceChatContext();
  const isVoiceActive = voiceState === VOICE_CHAT_STATE.Active;
  const referencePicker = useReferencePicker();
  const shouldReduceMotion = useReducedMotion();

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: false,
  });

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const shouldKeepActivePanelOnSend = Boolean(activeTab);

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const focusComposerAtEnd = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => focusEditorRef.current?.());
    });
  }, []);

  const expandSidebarIfCollapsed = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      expandSidebarIfCollapsed();

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleFileTab(path, name, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true });

        return;
      }

      openTab(path, name);
    },
    [activeTab, expandSidebarIfCollapsed, openSingleFileTab, openTab, pathname],
  );

  const handleOpenActiveFile = useCallback(() => {
    if (!activeFileInfo) return;
    handleFileOpen(activeFileInfo.path, activeFileInfo.name);
  }, [activeFileInfo, handleFileOpen]);

  const handleDetachActiveFile = useCallback(() => {
    setActiveFileInfo(null);
  }, [setActiveFileInfo]);

  const handleDatasetOpen = useCallback(
    (datasetId: string, name: string) => {
      expandSidebarIfCollapsed();

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleDatasetTab(datasetId, name, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true });

        return;
      }

      openDatasetTab(datasetId, name);
    },
    [activeTab, expandSidebarIfCollapsed, openDatasetTab, openSingleDatasetTab, pathname],
  );

  const handleTaskOpen = useCallback(
    (taskId: string, name: string, fullRoute?: string) => {
      expandSidebarIfCollapsed();
      const route = fullRoute ?? preserveSidebarParam(getChatTaskRoute({ taskId, taskTitle: name, inChat: true }));

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleTaskTab(taskId, name || taskId, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true }, route);

        return;
      }

      openTaskTab(taskId, name || taskId, undefined, route);
    },
    [activeTab, expandSidebarIfCollapsed, openSingleTaskTab, openTaskTab, pathname],
  );

  const interceptedActions = useMemo(
    () =>
      createConversationActions({
        createConversationV2: async (payload: CreateConversationPayloadTypeV2) => {
          const fileRefs = payload.message_content?.file_references;
          const agentMetadata = activeAgentInfo?.id
            ? {
                agent_id: activeAgentInfo.id,
                ...(activeAgentInfo.avatar && { avatar: activeAgentInfo.avatar }),
              }
            : undefined;
          const fileMetadata = activeFileInfo
            ? { file_path: activeFileInfo.path, file_name: activeFileInfo.name }
            : undefined;
          const metadata =
            agentMetadata || fileMetadata ? { ...(agentMetadata ?? {}), ...(fileMetadata ?? {}) } : undefined;

          if (!shouldKeepActivePanelOnSend) {
            startNewChat();
          }

          setChatMessageIntent({
            message: payload.message_content?.text || '',
            fileReferences: fileRefs?.map((ref) => ({ path: ref.path, name: ref.name })),
            references: payload.message_content?.references,
            llmModel: payload.llm_model,
            metadata,
            autoLoopEnabled: payload.pev_enabled,
          });

          setChatSidebarState(shouldKeepActivePanelOnSend ? CHAT_SIDEBAR_STATE.SIDEBAR : CHAT_SIDEBAR_STATE.EXPANDED);

          return { conversation_id: 'pending', message_id: '', status_message: '', title: '' };
        },
      }),
    [
      activeAgentInfo,
      activeFileInfo,
      shouldKeepActivePanelOnSend,
      startNewChat,
      setChatMessageIntent,
      setChatSidebarState,
    ],
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

  useEffect(() => {
    const handleDraftPrefilled = () => {
      pendingDraftFocusRef.current = true;
      focusComposerAtEnd();
    };

    window.addEventListener(CHAT_DRAFT_UPDATE_EVENT, handleDraftPrefilled);

    return () => window.removeEventListener(CHAT_DRAFT_UPDATE_EVENT, handleDraftPrefilled);
  }, [focusComposerAtEnd]);

  useEffect(() => {
    const hasDraft = inputValue.trim().length > 0;
    const shouldFocusDraft = pathname === ROUTES_PATH.CHAT && !isExpanded && hasDraft;

    if (!shouldFocusDraft) return;
    if (!pendingDraftFocusRef.current && didFocusHydratedDraftRef.current) return;

    pendingDraftFocusRef.current = false;
    didFocusHydratedDraftRef.current = true;
    focusComposerAtEnd();
  }, [pathname, isExpanded, inputValue, focusComposerAtEnd]);

  useEffect(() => {
    if (chatInputFocusRequestKey === 0) return;
    if (pathname !== ROUTES_PATH.CHAT) return;
    if (isExpanded) return;

    focusComposerAtEnd();
  }, [chatInputFocusRequestKey, pathname, isExpanded, focusComposerAtEnd]);

  return (
    <ConversationActionsContext.Provider value={interceptedActions}>
      <ConversationMessagesContext.Provider
        value={{
          messages: STUB_CONVERSATION_STATE.messages,
          queuedMessages: STUB_CONVERSATION_STATE.queuedMessages,
          hasMessages: STUB_CONVERSATION_STATE.hasMessages,
        }}
      >
        <ConversationStatusContext.Provider
          value={{
            conversationId: STUB_CONVERSATION_STATE.conversationId,
            isStreaming: STUB_CONVERSATION_STATE.isStreaming,
            isStopping: STUB_CONVERSATION_STATE.isStopping,
            isLoadingConversationHistory: STUB_CONVERSATION_STATE.isLoadingConversationHistory,
            isFetchingConversationHistory: STUB_CONVERSATION_STATE.isFetchingConversationHistory,
            isCreatingConversationV2: STUB_CONVERSATION_STATE.isCreatingConversationV2,
            isSendingMessage: STUB_CONVERSATION_STATE.isSendingMessage,
            isErrorConversationHistory: STUB_CONVERSATION_STATE.isErrorConversationHistory,
            errorConversationHistory: STUB_CONVERSATION_STATE.errorConversationHistory,
            isUninitializedConversationHistory: STUB_CONVERSATION_STATE.isUninitializedConversationHistory,
            isAnalysing: STUB_CONVERSATION_STATE.isAnalysing,
            sendMessageError: STUB_CONVERSATION_STATE.sendMessageError,
            sendMessageV2Error: STUB_CONVERSATION_STATE.sendMessageV2Error,
            createConversationV2Error: STUB_CONVERSATION_STATE.createConversationV2Error,
          }}
        >
          <ConversationInputContext.Provider
            value={{
              inputsRequired: STUB_CONVERSATION_STATE.inputsRequired,
              initiatedBy: STUB_CONVERSATION_STATE.initiatedBy,
            }}
          >
            <ConversationBrowserContext.Provider
              value={{
                isBrowserStreamingAvailable: STUB_CONVERSATION_STATE.isBrowserStreamingAvailable,
                browserSessionId: STUB_CONVERSATION_STATE.browserSessionId,
                taskSummaries: STUB_CONVERSATION_STATE.taskSummaries,
              }}
            >
              <ConversationStateContext.Provider value={STUB_CONVERSATION_STATE}>
                <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
                  <DropOverlay isVisible={isDragOver} />
                  <AnimatePresence>
                    {!isExpanded && (
                      <ChatActionsProvider
                        onFileOpen={handleFileOpen}
                        onDatasetOpen={handleDatasetOpen}
                        onTaskOpen={handleTaskOpen}
                      >
                        <motion.div
                          key='chat-home-page'
                          initial={false}
                          animate={{ opacity: 1, y: 0, transition: NO_ANIMATION }}
                          exit={
                            shouldReduceMotion
                              ? { transition: NO_ANIMATION }
                              : { opacity: 0, y: 30, transition: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] } }
                          }
                          className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-center overflow-hidden pb-[20vh]'
                          style={{ willChange: 'opacity, transform' }}
                        >
                          <ChatHome />
                          <div className='mt-7 w-full shrink-0 px-3'>
                            {activeFileInfo && (
                              <div className='mb-2 flex flex-wrap items-center gap-2'>
                                <FilePill
                                  filePath={activeFileInfo.path}
                                  fileName={activeFileInfo.name}
                                  onOpen={handleOpenActiveFile}
                                  onDetach={handleDetachActiveFile}
                                />
                              </div>
                            )}
                            <ConnectedChatInput
                              resourceType={ResourceType.ORGANIZATION}
                              resourceId={organizationId}
                              autoFocus
                              scope={ScopeType.ORGANIZATION}
                              scopeId={organizationId}
                              username={username}
                              currentUserName={currentUserName}
                              placeholder='What are we working on next?'
                              minTextareaHeight={18}
                              maxTextareaHeight={200}
                              className='shadow-chatbot-shadow rounded-[32px]'
                              inputAreaClassName='px-5 pt-4 pb-3'
                              footerClassName='px-3.5 pt-2 pb-3.5'
                              externalInputValue={inputValue}
                              setExternalInputValue={setInputValue}
                              fileDropHandlerRef={fileDropHandlerRef}
                              addFileReferenceRef={addFileReferenceRef}
                              addMentionRef={addMentionRef}
                              focusEditorRef={focusEditorRef}
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
                        </motion.div>
                      </ChatActionsProvider>
                    )}
                  </AnimatePresence>
                </div>
              </ConversationStateContext.Provider>
            </ConversationBrowserContext.Provider>
          </ConversationInputContext.Provider>
        </ConversationStatusContext.Provider>
      </ConversationMessagesContext.Provider>
    </ConversationActionsContext.Provider>
  );
};

export default ChatHomePage;
