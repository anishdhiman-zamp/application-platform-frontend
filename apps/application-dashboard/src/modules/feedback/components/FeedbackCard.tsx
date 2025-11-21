import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Trash2 } from 'lucide-react';
import { findTimeDifference } from 'modules/data/data.utils';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackCardProps {
  feedback: FeedbackItemType;
  icon: React.ReactNode;
  initiatedBy: string;
  timePrefix?: string;
  onCheck?: () => void;
  allowDelete?: boolean;
  setConfirmItem: (confirm: boolean) => void;
}

const FeedbackCard: FC<FeedbackCardProps> = ({
  feedback,
  icon,
  initiatedBy,
  timePrefix,
  onCheck,
  allowDelete,
  setConfirmItem,
}) => {
  const handleDelete = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmItem(true);
  };

  return (
    <div className={cn('flex cursor-pointer items-start gap-2 select-none')} onClick={onCheck}>
      {icon}
      <div className='min-w-0 flex-1'>
        <div className='f-12-450 text-gray-1000 max-w-[300px] truncate'>{feedback?.title}</div>
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
          id='delete-feedback'
        />
      )}
    </div>
  );
};

export default FeedbackCard;
