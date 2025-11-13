import { FC, useMemo, useRef } from 'react';
import { SOCKET_STATES } from '@deepgram/sdk';
import { useChat } from '@zamp-platform/chat';
import { Button, Textarea, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Check, CircleX, FileText, Loader, Mic, X } from 'lucide-react';
import AudioVisualizer from 'modules/chatbot/AudioVisualiser';
import useChatInput from 'modules/chatbot/useChatInput';
import { MicrophoneState } from '@/hooks/useMicrophoneRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { LocationData } from '@/types/api/feedbacks.types';

interface ChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation: LocationData;
  setIsLoading: (isLoading: boolean) => void;
  conversationId?: string;
  setHeader: (header: string) => void;
  isDisabled: boolean;
}
export const ChatInput: FC<ChatInputProps> = ({
  chat,
  annotationLocation,
  setIsLoading,
  conversationId,
  setHeader,
  isDisabled,
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
  } = useChatInput(chat, annotationLocation, setIsLoading, conversationId, setHeader);

  const { transcript, isRecording, startRecording, stopRecording, microphoneState, connectionState, microphone } =
    useTranscription();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleAttachClick = () => {
  //   fileInputRef.current?.click();
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    console.log('extension', extension);

    // You can customize icons based on file type
    return (
      <div className='flex h-5 w-6 items-center justify-center rounded-md bg-gray-100'>
        <FileText className='size-3.5' />
      </div>
    );
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
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

  return (
    <div className='w-full border-t p-3'>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        aria-label='File input'
      />

      {/* Attachments display */}
      {attachments.length > 0 && (
        <div className='mb-2 flex flex-wrap gap-2'>
          {attachments.map((attachment) => (
            <div
              key={attachment.file_id}
              className='rounded-2.5 shadow-table-filter-menu relative flex w-[148px] items-center gap-2 border border-gray-400 bg-white p-1'
            >
              <div className='flex items-center gap-1'>
                {getFileIcon(attachment.file_name)}
                <span className='f-12-500 max-w-[104px] truncate'>{attachment.file_name}</span>
              </div>
              <Button
                className='absolute -top-2 -right-2 size-4 rounded-full bg-white p-[1px] [&_svg]:size-3.5'
                variant='ghost'
                size='icon'
                onClick={() => removeAttachment(attachment.file_id)}
              >
                <CircleX className='size-3.5 text-gray-700' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress indicator */}
      {isUploading && (
        <div className='mb-2 text-sm text-gray-600'>
          <span>Uploading files...</span>
        </div>
      )}

      <div className={cn(shouldShowRecorder ? 'relative w-full rounded-md border border-gray-600 p-1.5' : '')}>
        {/* Middle - Textarea and button wrapper */}
        <div className='relative'>
          {shouldShowRecorder ? (
            <div className='flex w-full items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='bg-GRAY_200 hover:bg-GRAY_200 !size-5 [&_svg]:size-3'
                aria-label='Reject recording'
                onClick={handleReject}
              >
                <X className='text-GRAY_1000' />
              </Button>

              {/* Visualizer */}
              {microphone && <AudioVisualizer microphone={microphone} />}

              <Button
                size='icon'
                className='!size-5 [&_svg]:size-3'
                aria-label='Accept recording'
                onClick={handleAccept}
              >
                <Check className='text-white' />
              </Button>
            </div>
          ) : (
            <div className='rounded-xl border' onClick={handleContainerClick}>
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
                      className='!size-4 [&_svg]:size-3'
                      aria-label='Start recording'
                      onClick={handleStartRecording}
                      disabled={microphoneState === MicrophoneState.SettingUp || isDisabled}
                    >
                      <Mic className='text-gray-900' />
                    </Button>
                  )}
                  {/* <Button
                    variant='ghost'
                    size='icon'
                    className='!size-4 [&_svg]:size-3'
                    aria-label='Attach file'
                    onClick={handleAttachClick}
                    disabled={isUploading}
                  >
                    <Paperclip className='text-gray-900' />
                  </Button> */}
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
