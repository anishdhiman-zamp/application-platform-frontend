import { type FC } from 'react';
import { useDispatch } from 'react-redux';
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
import { useDeleteFeedbackMutation } from '@/apis/feedback';
import { removeFeedbackItem } from '@/store/slices/feedback.slice';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processId?: string;
  feedback: FeedbackItemType;
  onDeleteSuccess?: () => void;
}

const FeedbackDeleteDialog: FC<FeedbackDeleteDialogProps> = ({
  open,
  onOpenChange,
  processId = '',
  feedback,
  onDeleteSuccess,
}) => {
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (!processId || !feedback?.id) return;
    deleteFeedback({
      process_id: processId as string,
      feedback_ids: [feedback?.id as string],
    })
      .unwrap()
      .then(() => {
        dispatch(removeFeedbackItem({ id: feedback.id, status: feedback.status }));
        onOpenChange(false);
        onDeleteSuccess?.();
      })
      .catch(() => {
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size='medium'
        showCloseButton
        className='z-[1005] max-w-[640px]'
        dialogueOverlayClassName='z-[1004]'
      >
        <DialogHeader className='border-none'>
          <DialogHeaderTitle>Are you sure you want to delete this feedback?</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='px-4 pb-4'>
          <div className='bg-GRAY_50 border-GRAY_400 rounded-lg border border-dashed p-3'>
            <div className='f-12-450 text-GRAY_1000 truncate'>{feedback?.title}</div>
            <div className='f-11-450 text-GRAY_700 mt-1 truncate'>
              Started {findTimeDifference(feedback?.created_at)}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className='flex items-center justify-end gap-3'>
          <DialogClose asChild>
            <Button variant='outline' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button size='medium' className='w-14' onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDeleteDialog;
