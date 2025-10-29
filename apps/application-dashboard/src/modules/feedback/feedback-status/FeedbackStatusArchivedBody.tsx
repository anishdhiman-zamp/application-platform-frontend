import { type FC, useState } from 'react';
import { Archive, Loader, RotateCcw } from 'lucide-react';
import { useUnArchiveFeedbackMutation } from '@/apis/feedback';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusArchivedBodyProps {
  items: FeedbackItemType[];
  processId: string;
}

const FeedbackStatusArchivedBody: FC<FeedbackStatusArchivedBodyProps> = ({ items, processId }) => {
  const [unArchiveFeedback] = useUnArchiveFeedbackMutation();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleUnArchive = (id: string) => {
    if (loadingIds?.includes(id)) return;
    setLoadingIds((prev) => [...prev, id]);
    unArchiveFeedback({ process_id: processId, feedback_ids: [id] })
      .unwrap()
      .finally(() => {
        setLoadingIds((prev) => prev.filter((current) => current !== id));
      });
  };

  return (
    <div>
      <div className='f-14-400 text-GRAY_700'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <div key={item?.id} className='flex items-start gap-2 select-none'>
              <Archive size={12} className='mt-1' />
              <div className='min-w-0 flex-1'>
                <div className='f-12-450 text-gray-1000 truncate text-sm font-medium'>{item?.title}</div>
                <div className='f-11-450 mt-1 truncate text-xs text-gray-700'>{item?.initiated_by}</div>
              </div>
              {loadingIds.includes(item?.id) ? (
                <Loader size={12} className='mt-1 animate-spin text-gray-700' aria-label='Unarchiving...' />
              ) : (
                <RotateCcw onClick={() => handleUnArchive(item?.id)} size={14} className='mt-1 cursor-pointer' />
              )}
            </div>
          ))}
        </div>
        <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
          <div>These feedback have been applied and are ready for review</div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusArchivedBody;
