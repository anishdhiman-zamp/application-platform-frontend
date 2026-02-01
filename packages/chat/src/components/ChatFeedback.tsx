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
import { Loader2, ThumbsDown, Upload } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';

import { INPUT_FILE_FORMATS } from '@/types/common/mime';

import { useSubmitChatFeedbackMutation } from '../api';
import { useFileUpload } from '../hooks/useFileUpload';
import { ChatFeedbackCategory } from '../types/chat.types';
import { AttachmentsList } from './blocks';
import { FileMimeType } from './chat.constants';

export interface ChatFeedbackProps {
  messageId?: string;
  conversationId?: string;
  organizationId?: string;
  className?: string;
  disabled?: boolean;
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
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<string>('');
  const [details, setDetails] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const [submitChatFeedback, { isLoading: isSubmitting }] = useSubmitChatFeedbackMutation();

  const {
    files: attachments,
    isUploading,
    isDragOver,
    fileInputRef,
    dropZoneProps,
    handleFileInputChange,
    openFilePicker,
    removeFile,
    clearFiles,
    canAddMoreFiles,
  } = useFileUpload({
    organizationId,
    maxFiles: MAX_FILES,
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    acceptedMimeTypes: ACCEPTED_FILE_TYPES,
    getMimeType: (fileType: string) => FileMimeType[fileType] ?? fileType,
  });

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
  };

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
              <Textarea
                placeholder='What was unsatisfying about this response?'
                value={details}
                rows={3}
                onChange={(e) => setDetails(e.target.value)}
                className='border-GRAY_400 f-12-450 placeholder:text-GRAY_500 resize-none bg-white'
              />
            </div>

            {/* File Upload Section */}
            {organizationId && (
              <div className='space-y-2'>
                <label className='text-GRAY_900 f-12-500 block'>Supporting documents (optional)</label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileInputChange}
                  className='hidden'
                  aria-label='Upload attachments'
                />

                {/* Drop zone */}
                <div
                  {...dropZoneProps}
                  onClick={canAddMoreFiles && !isUploading ? openFilePicker : undefined}
                  className={cn(
                    'border-GRAY_400 flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-3 transition-colors',
                    isDragOver && 'border-PRIMARY_500 bg-PRIMARY_50',
                    !canAddMoreFiles && 'cursor-not-allowed opacity-50',
                    isUploading && 'cursor-wait',
                  )}
                >
                  {isUploading ? (
                    <div className='flex items-center'>
                      <Loader2 size={16} className='text-GRAY_500 animate-spin' />
                    </div>
                  ) : (
                    <>
                      <Upload size={16} className='text-GRAY_500 mb-1' />
                      <span className='text-GRAY_600 f-12-450 text-center'>
                        {isDragOver ? 'Drop files here' : 'Drag & drop or click to upload'}
                      </span>
                    </>
                  )}
                </div>

                {/* Attachments list */}
                <AttachmentsList attachments={attachments} removeAttachment={removeFile} isLoading={isUploading} />
              </div>
            )}
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
