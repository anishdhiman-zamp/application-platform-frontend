'use client';

import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import React, { Dispatch, FC, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';

import { useLazyGetSpeechToTextAccessTokenQuery } from '@/apis/voiceAgents';

import { useChat } from '../hooks/useChat';
import useChatAdapters from '../hooks/useChatAdapters';
import { useChatInput } from '../hooks/useChatInput';
import { MicrophoneState } from '../hooks/useMicrophoneRecorder';
import { useTranscription } from '../hooks/useTranscription';
import { AnnotationType, LocationData, ResourceType, ScopeType } from '../types/chat.types';
import { SOCKET_STATES } from '../types/transcription.types';
import { ChatComposer } from './ChatComposer';

export type FileDropHandlerRef = RefObject<((files: FileList) => void) | null>;
export type AddFileReferenceRef = RefObject<((ref: { path: string; name: string }) => void) | null>;

export interface ConnectedChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation?: LocationData;
  conversationId?: string;
  resourceType?: ResourceType;
  isDisabled?: boolean;
  header?: string;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
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
  minTextareaHeight?: number;
  maxTextareaHeight?: number;
  llmModel?: string | null;
  showModelSelector?: boolean;
  modelSelectorSlot?: React.ReactNode;
}

export const ConnectedChatInput: FC<ConnectedChatInputProps> = ({
  chat,
  annotationLocation,
  resourceType = ResourceType.PROCESS,
  conversationId,
  isDisabled = false,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
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
  minTextareaHeight,
  maxTextareaHeight,
  llmModel,
  showModelSelector,
  modelSelectorSlot,
}: ConnectedChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRejectingRef = useRef(false);
  const transcriptInsertionIndexRef = useRef(-1);

  // Use the app's baseApi for speech-to-text token fetching
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
      captureException(error);
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
    handleKeyDown,
    fileReferences,
    handleFileSelect,
    removeFileReference,
    addFileReference,
    isUploading,
    setFirstMessage,
    isSubmitDisabled,
  } = useChatInput({
    chat,
    annotationLocation,
    conversationId,
    scope,
    externalInputValue,
    setExternalInputValue,
    adapter: chatInputAdapter,
    resourceType,
    annotationType,
    onConversationCreated,
    isDisabled,
    llmModel,
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;

    if (files && files.length > 0) {
      e.preventDefault();
      handleFileSelect(files);
    }
  };

  const handleStartRecording = async () => {
    if (microphoneState === MicrophoneState.Error) {
      onMicrophoneError?.();
      toast.error('Microphone unavailable. Please check browser permissions and try again.');
      return;
    }
    isRejectingRef.current = false;
    transcriptInsertionIndexRef.current = -1;

    await startRecording();
  };

  const handleAccept = () => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  };

  const handleReject = () => {
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
  };

  const handleStop = useCallback(async () => {
    try {
      await chat.stopConversation();
    } catch {
      toast.error('Failed to stop generation. Please try again.');
    }
  }, [chat.stopConversation]);

  const shouldShowRecorder = useMemo(
    () => isRecording && connectionState === SOCKET_STATES.open,
    [isRecording, connectionState],
  );
  const isPreparingToRecord = useMemo(
    () => isRecording && connectionState !== SOCKET_STATES.open,
    [isRecording, connectionState],
  );

  useEffect(() => {
    if (setFirstMessage && defaultMessage) {
      setFirstMessage(defaultMessage);
    }
  }, [defaultMessage, setFirstMessage]);

  // Expose handleFileSelect to parent for external drag and drop
  useEffect(() => {
    if (fileDropHandlerRef && !disableAttachments && !isDisabled) {
      fileDropHandlerRef.current = handleFileSelect;
    }

    return () => {
      if (fileDropHandlerRef) {
        fileDropHandlerRef.current = null;
      }
    };
  }, [fileDropHandlerRef, handleFileSelect, disableAttachments, isDisabled]);

  // Expose addFileReference to parent for external file references
  useEffect(() => {
    if (addFileReferenceRef && !isDisabled) {
      addFileReferenceRef.current = addFileReference;
    }

    return () => {
      if (addFileReferenceRef) {
        addFileReferenceRef.current = null;
      }
    };
  }, [addFileReferenceRef, addFileReference, isDisabled]);

  return (
    <div className='w-full'>
      {/* Hidden file input */}
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
        onKeyDown={handleKeyDown}
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
        isStreaming={chat.isStreaming}
        onStop={handleStop}
        isStopping={chat.isStopping}
        className={className}
        minTextareaHeight={minTextareaHeight}
        maxTextareaHeight={maxTextareaHeight}
        modelSelectorSlot={showModelSelector ? modelSelectorSlot : undefined}
      />
    </div>
  );
};

export default ConnectedChatInput;
