'use client';

import { captureException } from '@sentry/nextjs';
import { Button, Textarea, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Check, Loader, Mic, Paperclip, X } from 'lucide-react';
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';

import { useLazyGetSpeechToTextAccessTokenQuery } from '@/apis/voiceAgents';

import { useChat } from '../hooks/useChat';
import useChatAdapters from '../hooks/useChatAdapters';
import { useChatInput } from '../hooks/useChatInput';
import { MicrophoneState } from '../hooks/useMicrophoneRecorder';
import { useTranscription } from '../hooks/useTranscription';
import { AnnotationType, LocationData, ResourceType, ScopeType } from '../types/chat.types';
import { SOCKET_STATES, SpeechToTextProvider } from '../types/transcription.types';
import { AudioVisualizer } from './AudioVisualizer';
import { AttachmentsList } from './blocks';
import { FileMimeType } from './chat.constants';

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
  speechToTextProvider?: SpeechToTextProvider;
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
  speechToTextProvider = SpeechToTextProvider.ELEVENLABS,
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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('An error occurred');
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
    provider: speechToTextProvider,
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

  const handleContainerClick = () => {
    if (!shouldShowRecorder && !isDisabled) {
      textareaRef.current?.focus();
    }
  };

  const handleStartRecording = async () => {
    if (microphoneState === MicrophoneState.Error) {
      onMicrophoneError?.();
      toast.error('Microphone unavailable. Please check browser permissions and try again.');
      return;
    }

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

  return (
    <div
      className={cn('w-full', {
        'pt-1.5': attachments.length > 0,
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
      <AttachmentsList attachments={attachments} removeAttachment={removeAttachment} isLoading={isUploading} />
      <div
        className={cn(shouldShowRecorder ? 'relative w-full rounded-xl border border-gray-600 p-1.5' : '', className)}
      >
        {/* Middle - Textarea and button wrapper */}
        <div className='relative'>
          {shouldShowRecorder ? (
            <div className='flex w-full items-center justify-between gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='bg-GRAY_200 hover:bg-GRAY_200 !size-5 rounded-full [&_svg]:size-3'
                aria-label='Reject recording'
                onClick={handleReject}
              >
                <X className='text-GRAY_1000' />
              </Button>

              {/* Visualizer */}
              {microphone && <AudioVisualizer microphone={microphone} />}

              <Button
                size='icon'
                className='!size-5 rounded-full [&_svg]:size-3'
                aria-label='Accept recording'
                onClick={handleAccept}
                disabled={isCommitting}
                isLoading={isCommitting}
              >
                <Check className='text-white' />
              </Button>
            </div>
          ) : (
            <div className='shadow-side-drawer-inner rounded-xl border' onClick={handleContainerClick}>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className='f-13-450 placeholder:text-muted-foreground m-2.5 min-h-0 w-[316px] resize-none overflow-y-auto border-none bg-transparent p-0 pr-0 shadow-none outline-none'
                style={{
                  height: '20px',
                  maxHeight: '200px',
                  lineHeight: '18px',
                }}
                disabled={isDisabled}
              />

              <div className='flex items-center justify-between py-2.5 pr-2.5 pl-1.5'>
                <div className='flex items-center gap-1'>
                  {isPreparingToRecord ? (
                    <Loader size={14} className='animate-spin text-gray-900' />
                  ) : (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hover:text-gray-1000 !size-4 rounded-[2px] text-gray-900 hover:bg-gray-300 [&_svg]:size-3'
                      aria-label='Start recording'
                      onClick={handleStartRecording}
                      disabled={microphoneState === MicrophoneState.SettingUp || isDisabled}
                    >
                      <Mic />
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:text-gray-1000 !size-4 rounded-[2px] text-gray-900 hover:bg-gray-300 [&_svg]:size-3'
                    aria-label='Attach file'
                    onClick={handleAttachClick}
                    disabled={isUploading || isDisabled || disableAttachments}
                  >
                    <Paperclip />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!value.trim() || isUploading || isDisabled}
                  size='icon'
                  aria-label='Send message'
                  className='!size-5 rounded-full [&_svg]:size-3'
                >
                  <ArrowUp />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectedChatInput;
