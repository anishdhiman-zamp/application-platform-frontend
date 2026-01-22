'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
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
import { ThumbsDown } from 'lucide-react';
import { FC, useState } from 'react';
import { toast } from 'sonner';

import { useSubmitChatFeedbackMutation } from '../api';
import { ChatFeedbackCategory } from '../types/chat.types';

export interface ChatFeedbackProps {
  messageId?: string;
  conversationId?: string;
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

const ChatFeedback: FC<ChatFeedbackProps> = ({ messageId, conversationId, className, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<string>('');
  const [details, setDetails] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const [submitChatFeedback, { isLoading: isSubmitting }] = useSubmitChatFeedbackMutation();

  const isFormValid = issueType && details.trim();

  const handleDislikeClick = () => {
    if (feedbackGiven || disabled) return;
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting || !conversationId || !messageId) return;

    try {
      await submitChatFeedback({
        conversationId,
        messageId,
        body: {
          category: issueType as ChatFeedbackCategory,
          description: details.trim(),
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
  };

  return (
    <>
      <TooltipProvider delayDuration={200}>
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
          className='max-h-[90vh] w-[500px] rounded-xl'
          title='Feedback'
          description='Submit feedback about this response'
        >
          <DialogHeader className='border-b-0 px-6 pt-6 pb-0'>
            <DialogHeaderTitle className='text-lg font-semibold'>Feedback</DialogHeaderTitle>
            <DialogClose className='absolute top-4 right-4' />
          </DialogHeader>

          <DialogBody className='space-y-4 px-6 py-4'>
            <div className='space-y-2'>
              <label className='text-GRAY_800 f-13-450 block'>What type of issue do you wish to report?</label>
              <Select
                options={ISSUE_TYPE_OPTIONS}
                placeholder='Select...'
                value={issueType}
                onValueChange={(value) => setIssueType(value as string)}
                controlClassName='bg-GRAY_100 border-GRAY_400 h-8'
                itemClassName='f-12-500'
                hideSearch
                contentClassName='w-(--radix-popover-trigger-width)'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-GRAY_800 f-13-450 block'>Please provide details:</label>
              <Textarea
                placeholder='What was unsatisfying about this response?'
                value={details}
                rows={3}
                onChange={(e) => setDetails(e.target.value)}
                className='bg-GRAY_100 border-GRAY_400 f-13-450 resize-none'
              />
            </div>

            <div className='border-GRAY_400 flex justify-end gap-3 border-t pt-2'>
              <Button variant='secondary' size='medium' onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant='default'
                size='medium'
                onClick={handleSubmit}
                disabled={!isFormValid}
                isLoading={isSubmitting}
                className='disabled:text-white disabled:opacity-50'
              >
                Submit
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatFeedback;
