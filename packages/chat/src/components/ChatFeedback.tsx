'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Select,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, Loader, Mic, Paperclip, ThumbsDown, X } from 'lucide-react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { INPUT_FILE_FORMATS } from '@/types/common/mime';

import { useLazyGetSpeechToTextAccessTokenQuery, useSubmitChatFeedbackMutation } from '../api';
import { useFileUpload } from '../hooks/useFileUpload';
import { MicrophoneState } from '../hooks/useMicrophoneRecorder';
import { useTranscription } from '../hooks/useTranscription';
import { ChatFeedbackCategory } from '../types/chat.types';
import { SOCKET_STATES, TranscriptionAdapter } from '../types/transcription.types';
import { AudioVisualizer } from './AudioVisualizer';
import { AttachmentsList } from './blocks';
import { FileMimeType } from './chat.constants';

export interface ChatFeedbackProps {
  messageId?: string;
  conversationId?: string;
  organizationId?: string;
  className?: string;
  disabled?: boolean;
  onMicrophoneError?: () => void;
  onRecordingError?: () => void;
}

const ISSUE_TYPE_OPTIONS = [
  { label: 'UI bug', value: 'UI_BUG' },
  { label: 'Overactive refusal', value: 'OVERACTIVE_REFUSAL' },
  { label: 'Did not fully follow my request', value: 'DID_NOT_FOLLOW_REQUEST' },
  { label: 'Not factually correct', value: 'NOT_FACTUALLY_CORRECT' },
  { label: 'Incomplete response', value: 'INCOMPLETE_RESPONSE' },
  { label: 'Should have searched the web', value: 'SHOULD_HAVE_SEARCHED_WEB' },
  { label: 'Memory not applied', value: 'MEMORY_NOT_APPLIED' },
  { label: 'Report content', value: 'REPORT_CONTENT' },
  { label: 'Other', value: 'OTHER' },
];

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

const ChatFeedback: FC<ChatFeedbackProps> = ({
  messageId,
  conversationId,
  organizationId,
  className,
  disabled = false,
  onMicrophoneError,
  onRecordingError,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<string>('');
  const [details, setDetails] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const [submitChatFeedback, { isLoading: isSubmitting }] = useSubmitChatFeedbackMutation();
  const [getSpeechToTextAccessToken] = useLazyGetSpeechToTextAccessTokenQuery({});

  const getElevenLabsToken = useCallback(async () => {
    try {
      const result = await getSpeechToTextAccessToken({}).unwrap();
      return result.access_token;
    } catch (error) {
      toast.error('Failed to get speech-to-text access token');
      throw error;
    }
  }, [getSpeechToTextAccessToken]);

  const transcriptionAdapter: TranscriptionAdapter = useMemo(
    () => ({
      getElevenLabsToken,
      onError: (error) => {
        toast.error(`${error instanceof Error ? error.message : 'An error occurred'}`);
      },
    }),
    [getElevenLabsToken],
  );

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

  const {
    files: attachments,
    isUploading,
    fileInputRef,
    handleFileInputChange,
    openFilePicker,
    removeFile,
    clearFiles,
  } = useFileUpload({
    organizationId,
    maxFiles: MAX_FILES,
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    acceptedMimeTypes: ACCEPTED_FILE_TYPES,
    getMimeType: (fileType: string) => FileMimeType[fileType] ?? fileType,
  });

  const handleAttachClick = () => {
    openFilePicker();
  };

  const shouldShowRecorder = useMemo(
    () => isRecording && connectionState === SOCKET_STATES.open,
    [isRecording, connectionState],
  );
  const isPreparingToRecord = useMemo(
    () => isRecording && connectionState !== SOCKET_STATES.open,
    [isRecording, connectionState],
  );

  const isFormValid = issueType && details.trim();

  const handleDislikeClick = () => {
    if (feedbackGiven || disabled) return;
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting || !conversationId || !messageId) return;

    try {
      const fileUploadIds = attachments.length > 0 ? attachments.map((a) => a.file_id) : undefined;

      await submitChatFeedback({
        conversationId,
        messageId,
        body: {
          category: issueType as ChatFeedbackCategory,
          description: details.trim(),
          file_upload_ids: fileUploadIds,
        },
      }).unwrap();

      setFeedbackGiven(true);
      setIsModalOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIssueType('');
    setDetails('');
    clearFiles();
    if (isRecording) {
      stopRecording();
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

  const handleAcceptRecording = () => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  };

  const handleRejectRecording = () => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
      onRecordingError?.();
    }
  };

  useEffect(() => {
    if (transcript) {
      setDetails((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  return (
    <>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleDislikeClick}
                disabled={feedbackGiven || disabled}
                className={cn(
                  'hover:bg-GRAY_100 active:bg-GRAY_300 hover:text-GRAY_600 h-4 w-4 rounded-sm p-[2px]',
                  feedbackGiven && 'bg-none',
                  className,
                )}
                aria-label='Bad response'
              >
                <ThumbsDown size={12} className={cn('text-GRAY_500', feedbackGiven && 'text-black')} />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center' className='f-10-450 p-1.5' sideOffset={4}>
            <p>Give negative feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          size='small'
          className='max-h-[90vh] w-[550px] gap-y-4 rounded-[14px]'
          title='Feedback'
          description='Submit feedback about this response'
          showCloseButton
          closeButtonClassName='top-[23px] right-5'
        >
          <DialogHeader className='h-fit border-b-0 px-5 pt-5'>
            <DialogHeaderTitle className='f-16-600'>Feedback</DialogHeaderTitle>
          </DialogHeader>

          <DialogBody className='flex flex-col gap-y-4 px-5'>
            <div className='space-y-2'>
              <label className='text-GRAY_900 f-12-500 block'>What type of issue do you wish to report?</label>
              <Select
                options={ISSUE_TYPE_OPTIONS}
                placeholder='Select...'
                value={issueType}
                onValueChange={(value) => setIssueType(value as string)}
                controlClassName='bg-white border-GRAY_400 h-8'
                itemClassName='f-12-450'
                hideSearch
                contentClassName='w-(--radix-popover-trigger-width)'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-GRAY_900 f-12-500 block'>Please provide details:</label>

              {/* Hidden file input */}
              {organizationId && (
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileInputChange}
                  className='hidden'
                  aria-label='Upload attachments'
                />
              )}

              <div
                className={cn(
                  'border-GRAY_400 focus-within:border-GRAY_600 relative w-full rounded-lg border bg-white transition-all',
                  shouldShowRecorder && 'border-gray-400',
                )}
              >
                {/* Attachments list above textarea */}
                <AttachmentsList
                  attachments={attachments}
                  removeAttachment={removeFile}
                  isLoading={isUploading}
                  className='px-2.5 pt-2'
                />

                {shouldShowRecorder ? (
                  <div className='flex w-full items-center justify-between gap-2 p-2.5'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='bg-GRAY_200 hover:bg-GRAY_200 !size-5 rounded-full [&_svg]:size-3'
                      aria-label='Reject recording'
                      onClick={handleRejectRecording}
                    >
                      <X className='text-GRAY_1000' />
                    </Button>

                    {/* Visualizer */}
                    {microphone && <AudioVisualizer microphone={microphone} />}

                    <Button
                      size='icon'
                      className='!size-5 rounded-full [&_svg]:size-3'
                      aria-label='Accept recording'
                      onClick={handleAcceptRecording}
                      disabled={isCommitting}
                      isLoading={isCommitting}
                    >
                      <Check className='text-white' />
                    </Button>
                  </div>
                ) : (
                  <div className='flex w-full flex-col pt-2.5'>
                    <div className='px-2.5'>
                      <Textarea
                        placeholder='What was unsatisfying about this response?'
                        value={details}
                        rows={3}
                        onChange={(e) => setDetails(e.target.value)}
                        className='f-12-450 placeholder:text-GRAY_500 min-h-0 resize-none border-none bg-transparent p-0 shadow-none outline-none'
                      />
                    </div>
                    <div className='flex items-center justify-between py-2.5 pr-2.5 pl-1.5'>
                      {organizationId && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='hover:text-gray-1000 !size-5 rounded-[2px] p-[2px] text-gray-900 hover:bg-gray-100 [&_svg]:size-3'
                          aria-label='Attach file'
                          onClick={handleAttachClick}
                          disabled={isUploading}
                        >
                          <Paperclip />
                        </Button>
                      )}
                      {!organizationId && <div />}
                      <div className='flex items-center gap-x-2'>
                        {isPreparingToRecord ? (
                          <Loader size={14} className='animate-spin text-gray-900' />
                        ) : (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='hover:text-gray-1000 !size-5 rounded-[2px] p-[2px] text-gray-900 hover:bg-gray-100 [&_svg]:size-3'
                            aria-label='Start recording'
                            onClick={handleStartRecording}
                            disabled={microphoneState === MicrophoneState.SettingUp}
                          >
                            <Mic />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className='mt-2 flex justify-end gap-x-2.5 px-5 py-4'>
            <Button variant='secondary' size='medium' onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant='default'
              size='medium'
              onClick={handleSubmit}
              disabled={!isFormValid || isUploading}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatFeedback;
