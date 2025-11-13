import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';
import { findTimeDifference } from 'modules/data/data.utils';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { RootState } from '@/store';
import { defaultFnType } from '@/types/commonTypes';
import { formatPlural } from '@/utils/common';

interface StopProcessingFeedbackProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStopProcessing: defaultFnType;
}

const StopProcessingFeedback: FC<StopProcessingFeedbackProps> = ({ isOpen, onOpenChange, onStopProcessing }) => {
  const processingFeedbackItems = useSelector((state: RootState) =>
    state?.feedbacks?.feedbackItems.filter((item) => item.status === FEEDBACK_STATUS.PROCESSING),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton size='small'>
        <DialogHeader className='border-none'>
          <DialogHeaderTitle>
            Stop processing {formatPlural(processingFeedbackItems?.length, 'feedback')} ?
          </DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='border-none px-5 pb-6'>
          <div className='bg-BG_GRAY_2 space-y-1.5 rounded-[8px] border border-dashed p-4'>
            {processingFeedbackItems?.map((item) => (
              <div key={item.id} className='space-y-1'>
                <div className='f-12-450'>{item.title}</div>
                <div className='f-11-450 text-gray-900'>Started {findTimeDifference(item.created_at)}</div>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter className='flex items-center justify-between'>
          <span className='f-12-450 text-gray-900'>All feedback will be moved to the queue</span>
          <div className='flex items-center gap-2.5'>
            <DialogClose asChild>
              <Button variant='outline' size='medium'>
                Cancel
              </Button>
            </DialogClose>
            <Button size='medium' onClick={onStopProcessing}>
              Stop
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StopProcessingFeedback;
