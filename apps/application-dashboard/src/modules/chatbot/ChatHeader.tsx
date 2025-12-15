import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Trash } from 'lucide-react';
import FeedbackDeleteDialog from 'modules/feedback/components/FeedbackDeleteDialog';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

const ChatHeader = ({
  title,
  feedbackItem,
  onDeleteSuccess,
}: {
  title: string;
  feedbackItem?: FeedbackItemType;
  onDeleteSuccess: () => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isAnalysing = title === 'Analysing...';
  const displayTitle = title || 'Ask questions or give feedback';
  const hasRealTitle = !!title && !isAnalysing;

  return (
    <>
      <div
        className={cn(
          'shadow-table-filter-menu flex items-center justify-between rounded-t-2xl border bg-white p-3.5',
          {
            'f-12-550': hasRealTitle,
            'f-12-450 text-gray-700': !hasRealTitle,
          },
        )}
      >
        <span className='max-w-[340px] truncate'>{displayTitle}</span>
        {feedbackItem && (
          <Button
            variant='ghost'
            size='icon'
            className='!size-4 [&_svg]:size-3.5'
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className='text-gray-700' />
          </Button>
        )}
      </div>
      <FeedbackDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open: boolean) => !open && setIsDeleteDialogOpen(false)}
        feedback={feedbackItem as FeedbackItemType}
        processId={feedbackItem?.process_id}
        onDeleteSuccess={onDeleteSuccess}
        isDraftFeedback={feedbackItem?.status === FEEDBACK_STATUS.DRAFT}
      />
    </>
  );
};

export default ChatHeader;
