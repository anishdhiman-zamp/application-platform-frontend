import { FC, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Trash2 } from 'lucide-react';
import { findTimeDifference } from 'modules/data/data.utils';
import FeedbackDeleteDialog from 'modules/feedback/components/FeedbackDeleteDialog';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackListCardProps {
  feedback: FeedbackItemType;
  icon: React.ReactNode;
  initiatedBy: string;
  timePrefix?: string;
  processId?: string;
  onCheck?: () => void;
  allowDelete?: boolean;
}

const FeedbackListCard: FC<FeedbackListCardProps> = ({
  feedback,
  icon,
  initiatedBy,
  processId,
  allowDelete,
  onCheck,
  timePrefix,
}) => {
  const [confirmItem, setConfirmItem] = useState<boolean>(false);

  const handleDelete = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    setConfirmItem(true);
  };

  return (
    <div className={cn('flex items-start gap-2 select-none', !!onCheck && 'cursor-pointer')} onClick={onCheck}>
      {icon}
      <div className='min-w-0 flex-1'>
        <div className='f-12-450 text-gray-1000 truncate'>{feedback?.title}</div>
        <div className='mt-1 flex items-center gap-1.5'>
          <div className='f-11-450 truncate text-gray-700'>
            {timePrefix
              ? `${timePrefix} ${findTimeDifference(feedback?.created_at)}`
              : findTimeDifference(feedback?.created_at)}
          </div>
          {initiatedBy && <div className='h-[2px] w-[2px] rounded-full bg-gray-700'></div>}
          <div className='f-11-450 truncate text-gray-700'>{feedback?.initiated_by}</div>
        </div>
      </div>
      {allowDelete && (
        <Trash2
          onClick={handleDelete}
          size={12}
          className='mt-1 cursor-pointer opacity-70 transition-opacity duration-200 hover:opacity-100'
          aria-label='Delete feedback'
        />
      )}
      {allowDelete && confirmItem && (
        <FeedbackDeleteDialog
          open={confirmItem}
          onOpenChange={(open) => !open && setConfirmItem(false)}
          feedback={feedback}
          processId={processId}
        />
      )}
    </div>
  );
};

export default FeedbackListCard;
