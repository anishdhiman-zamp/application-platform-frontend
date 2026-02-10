'use client';

import { captureException } from '@sentry/nextjs';
import { toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { Dispatch, FC, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';

import { useLazyGetSpeechToTextAccessTokenQuery } from '@/apis/voiceAgents';

import { useChat } from '../hooks/useChat';
import useChatAdapters from '../hooks/useChatAdapters';
import { useChatInput } from '../hooks/useChatInput';
import { MicrophoneState } from '../hooks/useMicrophoneRecorder';
import { useTranscription } from '../hooks/useTranscription';
import { AnnotationType, LocationData, ResourceType, ScopeType } from '../types/chat.types';
import { SOCKET_STATES } from '../types/transcription.types';
import { filesToFileList, filterPastedFiles } from '../utils/fileUpload';
import { FileMimeType } from './chat.constants';
import { ChatComposer } from './ChatComposer';

export type FileDropHandlerRef = RefObject<((files: FileList) => void) | null>;

export interface ConnectedChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation?: LocationData;
  conversationId?: string;
  setHeader?: (header: string) => void;
  resourceType?: ResourceType;
  isDisabled?: boolean;
  header?: string;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  autoFocus?: boolean;
  acceptedFileTypes?: string;
  onMicrophoneError?: () => void;
  onRecordingError?: () => void;
  currentUserName: string;
  resourceId: string;
  scopeId: string;
  organizationId: string;
  onError?: (error: unknown) => void;
  onSuccess?: (message: string) => void;
  placeholder?: string;
  className?: string;
  disableAttachments?: boolean;
  annotationType?: AnnotationType;
  defaultMessage?: string;
  onConversationCreated?: (conversationId: string) => void;
  fileDropHandlerRef?: FileDropHandlerRef;
}

export const ConnectedChatInput: FC<ConnectedChatInputProps> = ({
  chat,
  annotationLocation,
  resourceType = ResourceType.PROCESS,
  conversationId,
  setHeader,
  isDisabled = false,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  autoFocus = false,
  acceptedFileTypes,
  onMicrophoneError,
  onRecordingError,
  currentUserName,
  resourceId,
  scopeId,
  organizationId,
  onError,
  onSuccess,
  placeholder = 'Ask anything or give feedback...',
  annotationType,
  className,
  disableAttachments = false,
  defaultMessage,
  onConversationCreated,
  fileDropHandlerRef,
}: ConnectedChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRejectingRef = useRef(false);

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
    getOrganizationId: () => organizationId,
    getMimeType: (fileType: string) => FileMimeType[fileType] ?? fileType,
    getElevenLabsToken,
    onError: (error) => {
      captureException(error);
      onError?.(error);
      toast.error(`${error instanceof Error ? error.message : 'An error occurred'}`);
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
    textareaRef,
    attachments,
    handleFileSelect,
    removeAttachment,
    isUploading,
    setFirstMessage,
    isSubmitDisabled,
  } = useChatInput({
    chat,
    annotationLocation,
    conversationId,
    setHeader,
    scope,
    externalInputValue,
    setExternalInputValue,
    adapter: chatInputAdapter,
    resourceType,
    annotationType,
    onConversationCreated,
    isDisabled,
  });

  const {
    transcript,
    isRecording,
    startRecording,
    stopRecording,
    microphoneState,
    connectionState,
    microphone,
    isCommitting,
  } = useTranscription({
    adapter: transcriptionAdapter,
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

      const { acceptedFiles, rejectedExtensionsText } = filterPastedFiles(files, acceptedFileTypes);

      if (rejectedExtensionsText) {
        toast.error?.(`${rejectedExtensionsText} file type is not supported`);

        if (acceptedFiles.length === 0) {
          return;
        }
      }

      handleFileSelect(filesToFileList(acceptedFiles));
    }
  };

  const handleStartRecording = async () => {
    if (microphoneState === MicrophoneState.Error) {
      onMicrophoneError?.();
      toast.error('Microphone unavailable. Please check browser permissions and try again.');
      return;
    }
    isRejectingRef.current = false;

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
      setValue((prev) => prev.replace(transcript, '').trim());
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  };

  const shouldShowRecorder = useMemo(
    () => isRecording && connectionState === SOCKET_STATES.open,
    [isRecording, connectionState],
  );
  const isPreparingToRecord = useMemo(
    () => isRecording && connectionState !== SOCKET_STATES.open,
    [isRecording, connectionState],
  );

  useEffect(() => {
    if (isRejectingRef.current) {
      return;
    }
    setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, [transcript, setValue]);

  useEffect(() => {
    if (autoFocus && !isDisabled && !shouldShowRecorder) {
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, isDisabled, shouldShowRecorder]);

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

  return (
    <div
      className={cn('w-full', {
        'cursor-not-allowed opacity-50': isDisabled,
      })}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        aria-label='File input'
        accept={acceptedFileTypes}
      />

      <ChatComposer
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        textareaRef={textareaRef}
        onKeyDown={handleKeyDown}
        onPaste={isDisabled || disableAttachments ? undefined : handlePaste}
        autoFocus={autoFocus}
        disabled={isDisabled}
        attachments={attachments}
        removeAttachment={removeAttachment}
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
        className={className}
        onContainerClick={() => textareaRef.current?.focus()}
      />
    </div>
  );
};

export default ConnectedChatInput;
