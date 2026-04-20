'use client';

import { captureException } from '@sentry/nextjs';
import {
  type AnnotationType,
  ChatComposer,
  createSnippetFile,
  filesToFileList,
  isLargeText,
  type LocationData,
  MicrophoneState,
  type ResourceType,
  ScopeType,
  type UploadedFile,
  useChatAdapters,
  useTranscription,
} from '@zamp-platform/chat';
import { SOCKET_STATES } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import React, {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useLazyGetSpeechToTextAccessTokenQuery } from '@/apis/voiceAgents';

import { type ChatInputActions, useChatInput } from '../hooks/useChatInput';
import { useConversationActions } from '../hooks/useConversationActions';
import { useConversationState } from '../hooks/useConversationState';

export type FileDropHandlerRef = RefObject<((files: FileList) => void) | null>;
export type AddFileReferenceRef = RefObject<((ref: { path: string; name: string }) => void) | null>;

export interface ConnectedChatInputProps {
  annotationLocation?: LocationData;
  conversationId?: string;
  resourceType?: ResourceType;
  isDisabled?: boolean;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  externalFileReferences?: UploadedFile[];
  setExternalFileReferences?: Dispatch<SetStateAction<UploadedFile[]>>;
  externalFilePathsRef?: React.RefObject<Set<string>>;
  autoFocus?: boolean;
  onMicrophoneError?: () => void;
  onRecordingError?: () => void;
  currentUserName: string;
  resourceId: string;
  scopeId: string;
  username: string;
  onError?: (error: unknown) => void;
  onSuccess?: (message: string) => void;
  placeholder?: string;
  className?: string;
  disableAttachments?: boolean;
  annotationType?: AnnotationType;
  defaultMessage?: string;
  onConversationCreated?: (conversationId: string) => void;
  fileDropHandlerRef?: FileDropHandlerRef;
  addFileReferenceRef?: AddFileReferenceRef;
  onFileReferencesChange?: (refs: { path: string; name: string }[]) => void;
  minTextareaHeight?: number;
  maxTextareaHeight?: number;
  llmModel?: string | null;
  showModelSelector?: boolean;
  modelSelectorSlot?: React.ReactNode;
  autoLoopEnabled?: boolean;
  autoLoopToggleSlot?: React.ReactNode;
  voiceChatSlot?: React.ReactNode;
  hideRecordingButton?: boolean;
  hideStopButton?: boolean;
  metadata?: Record<string, unknown>;
}

export const ConnectedChatInput = ({
  annotationLocation,
  resourceType,
  conversationId: conversationIdProp,
  isDisabled = false,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  externalFileReferences,
  setExternalFileReferences,
  externalFilePathsRef,
  autoFocus = false,
  onMicrophoneError,
  onRecordingError,
  currentUserName,
  resourceId,
  scopeId,
  username,
  onError,
  onSuccess,
  placeholder = 'Ask anything or give feedback...',
  annotationType,
  className,
  disableAttachments = false,
  defaultMessage,
  onConversationCreated,
  fileDropHandlerRef,
  addFileReferenceRef,
  onFileReferencesChange,
  minTextareaHeight,
  maxTextareaHeight,
  llmModel,
  showModelSelector,
  modelSelectorSlot,
  autoLoopEnabled,
  autoLoopToggleSlot,
  voiceChatSlot,
  hideRecordingButton = false,
  hideStopButton = false,
  metadata,
}: ConnectedChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRejectingRef = useRef(false);
  const transcriptInsertionIndexRef = useRef(-1);

  const actions = useConversationActions();
  const {
    isStreaming,
    isStopping,
    isAnalysing,
    conversationId: ctxConversationId,
    messages,
    queuedMessages,
  } = useConversationState();

  const resolvedConversationId = conversationIdProp ?? ctxConversationId ?? '';

  const chatInputActions: ChatInputActions = useMemo(
    () => ({
      sendMessage: actions.sendMessage,
      createConversationV2: actions.createConversationV2,
      messages,
    }),
    [actions.sendMessage, actions.createConversationV2, messages],
  );

  const [getSpeechToTextAccessToken] = useLazyGetSpeechToTextAccessTokenQuery({});

  const getElevenLabsToken = useCallback(async () => {
    const result = await getSpeechToTextAccessToken({}).unwrap();
    return result.access_token;
  }, [getSpeechToTextAccessToken]);

  const { chatInputAdapter, transcriptionAdapter } = useChatAdapters({
    getCurrentUserName: () => currentUserName || '',
    getResourceId: () => resourceId,
    getScopeId: () => scopeId,
    getUsername: () => username || '',
    getElevenLabsToken,
    onError: (error) => {
      captureException(error instanceof Error ? error : new Error(String(error)));
      onError?.(error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    },
    onSuccess: (message) => {
      onSuccess?.(message);
      toast.success(message);
    },
  });

  const {
    value,
    setValue,
    handleSubmit,
    fileReferences,
    handleFileSelect,
    removeFileReference,
    addFileReference,
    isUploading,
    setFirstMessage,
    isSubmitDisabled,
  } = useChatInput({
    chatActions: chatInputActions,
    annotationLocation,
    conversationId: resolvedConversationId,
    scope,
    externalInputValue,
    setExternalInputValue,
    externalFileReferences,
    setExternalFileReferences,
    externalFilePathsRef,
    adapter: chatInputAdapter,
    resourceType,
    annotationType,
    onConversationCreated,
    isDisabled,
    llmModel,
    autoLoopEnabled,
    metadata,
  });

  const handleTranscriptChunk = useCallback(
    (chunk: string) => {
      if (isRejectingRef.current) return;
      setValue((prev) => {
        if (transcriptInsertionIndexRef.current === -1) {
          transcriptInsertionIndexRef.current = prev.length > 0 ? prev.length + 1 : 0;
        }
        return prev ? `${prev} ${chunk}` : chunk;
      });
    },
    [setValue],
  );

  const { isRecording, startRecording, stopRecording, microphoneState, connectionState, microphone, isCommitting } =
    useTranscription({
      adapter: transcriptionAdapter,
      onTranscriptChunk: handleTranscriptChunk,
    });

  const shouldShowRecorder = useMemo(
    () => isRecording && connectionState === SOCKET_STATES.open,
    [isRecording, connectionState],
  );
  const isPreparingToRecord = useMemo(
    () => isRecording && connectionState !== SOCKET_STATES.open,
    [isRecording, connectionState],
  );

  const handleAttachClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileSelect],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        e.preventDefault();
        handleFileSelect(files);
        return;
      }

      const text = e.clipboardData?.getData('text/plain') ?? '';
      if (isLargeText(text)) {
        e.preventDefault();
        const existingNames = fileReferences.map((ref) => ref.name);
        const file = createSnippetFile(text, existingNames);
        handleFileSelect(filesToFileList([file]));
      }
    },
    [handleFileSelect, fileReferences],
  );

  const handleStartRecording = useCallback(async () => {
    if (microphoneState === MicrophoneState.Error) {
      onMicrophoneError?.();
      toast.error('Microphone unavailable. Please check browser permissions and try again.');
      return;
    }
    isRejectingRef.current = false;
    transcriptInsertionIndexRef.current = -1;
    await startRecording();
  }, [microphoneState, onMicrophoneError, startRecording]);

  const handleAccept = useCallback(() => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  }, [stopRecording, onRecordingError]);

  const handleReject = useCallback(() => {
    try {
      isRejectingRef.current = true;
      setValue((prev) => {
        if (transcriptInsertionIndexRef.current === -1) return prev;
        return prev.slice(0, transcriptInsertionIndexRef.current).trim();
      });
      transcriptInsertionIndexRef.current = -1;
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  }, [setValue, stopRecording, onRecordingError]);

  const restoreQueuedIntoInput = useCallback(() => {
    if (queuedMessages.length === 0) return;

    const restoredText = queuedMessages
      .map((m) => m.message_content?.text ?? '')
      .filter(Boolean)
      .join('\n\n');

    if (restoredText) {
      setValue((prev) => (prev.trim() ? `${prev}\n\n${restoredText}` : restoredText));
    }

    queuedMessages.forEach((m) => {
      (m.message_content?.file_references ?? []).forEach((ref) => {
        addFileReference({ path: ref.path, name: ref.name });
      });
    });

    actions.clearQueuedMessages();
  }, [queuedMessages, setValue, addFileReference, actions]);

  const handleStop = useCallback(async () => {
    restoreQueuedIntoInput();
    try {
      await actions.stopConversation();
    } catch {
      toast.error('Failed to stop generation. Please try again.');
    }
  }, [actions, restoreQueuedIntoInput]);

  useEffect(() => {
    if (setFirstMessage && defaultMessage) {
      setFirstMessage(defaultMessage);
    }
  }, [defaultMessage, setFirstMessage]);

  useEffect(() => {
    if (fileDropHandlerRef && !disableAttachments && !isDisabled) {
      fileDropHandlerRef.current = handleFileSelect;
    }
    return () => {
      if (fileDropHandlerRef) fileDropHandlerRef.current = null;
    };
  }, [fileDropHandlerRef, handleFileSelect, disableAttachments, isDisabled]);

  useEffect(() => {
    if (addFileReferenceRef && !isDisabled) {
      addFileReferenceRef.current = addFileReference;
    }
    return () => {
      if (addFileReferenceRef) addFileReferenceRef.current = null;
    };
  }, [addFileReferenceRef, addFileReference, isDisabled]);

  useEffect(() => {
    onFileReferencesChange?.(fileReferences.map((ref) => ({ path: ref.path, name: ref.name })));
  }, [fileReferences, onFileReferencesChange]);

  return (
    <div className='relative w-full'>
      <input
        ref={fileInputRef}
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        aria-label='File input'
      />
      <ChatComposer
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        onPaste={disableAttachments ? undefined : handlePaste}
        autoFocus={autoFocus}
        fileReferences={fileReferences}
        onRemoveFileReference={removeFileReference}
        isUploading={isUploading}
        onAttachClick={handleAttachClick}
        showAttachButton={!disableAttachments}
        shouldShowRecorder={shouldShowRecorder}
        isPreparingToRecord={isPreparingToRecord}
        microphone={microphone}
        isCommitting={isCommitting}
        onStartRecording={handleStartRecording}
        onAcceptRecording={handleAccept}
        onRejectRecording={handleReject}
        microphoneDisabled={microphoneState === MicrophoneState.SettingUp}
        showSubmitButton
        onSubmit={handleSubmit}
        isSubmitDisabled={isSubmitDisabled}
        isStreaming={hideStopButton ? false : isStreaming || isAnalysing}
        onStop={hideStopButton ? undefined : handleStop}
        isStopping={hideStopButton ? false : isStopping}
        className={className}
        minTextareaHeight={minTextareaHeight}
        maxTextareaHeight={maxTextareaHeight}
        modelSelectorSlot={showModelSelector ? modelSelectorSlot : undefined}
        autoLoopToggleSlot={autoLoopToggleSlot}
        voiceChatSlot={voiceChatSlot}
        hideRecordingButton={hideRecordingButton}
      />
    </div>
  );
};
