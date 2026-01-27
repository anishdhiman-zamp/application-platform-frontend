import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { SOCKET_STATES } from '@deepgram/sdk';
import { AttachmentsList, LocationData, ScopeType, useChat } from '@zamp-platform/chat';
import { Button, Textarea, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Check, Loader, Mic, Paperclip, X } from 'lucide-react';
import AudioVisualizer from 'modules/chatbot/AudioVisualiser';
import useChatInput from 'modules/chatbot/useChatInput';
import { MicrophoneState } from '@/hooks/useMicrophoneRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';

interface ChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation?: LocationData;
  conversationId?: string;
  setHeader: (header: string) => void;
  isDisabled: boolean;
  header: string;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  autoFocus?: boolean;
}
export const ChatInput: FC<ChatInputProps> = ({
  chat,
  annotationLocation,
  conversationId,
  setHeader,
  isDisabled,
  header,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  autoFocus = false,
}) => {
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
    firstMessage,
  } = useChatInput({
    chat,
    annotationLocation,
    conversationId,
    setHeader,
    scope,
    externalInputValue,
    setExternalInputValue,
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
  } = useTranscription();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const handleReject = () => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
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
      className={cn('w-full border-t p-3', {
        'border-none p-0': !(firstMessage || header),
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
        accept={`${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.DOCX},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`}
      />
      <AttachmentsList
        attachments={attachments}
        removeAttachment={removeAttachment}
        isLoading={isUploading}
        className='mb-2'
      />
      <div className={cn(shouldShowRecorder ? 'relative w-full rounded-xl border border-gray-600 p-1.5' : '')}>
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
                placeholder='Ask anything or give feedback...'
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
                  {/* TODO: Add back when PACE is ready to handle attachments */}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:text-gray-1000 !size-4 rounded-[2px] text-gray-900 hover:bg-gray-300 [&_svg]:size-3'
                    aria-label='Attach file'
                    onClick={handleAttachClick}
                    disabled={isUploading || isDisabled}
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
