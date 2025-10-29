import { type FC, useState } from 'react';
import { Archive, Loader } from 'lucide-react';
import { useArchiveFeedbackMutation } from '@/apis/feedback';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusOpenBodyProps {
  items: FeedbackItemType[];
  processId: string;
}

const FeedbackStatusOpenBody: FC<FeedbackStatusOpenBodyProps> = ({ items, processId }) => {
  const [archiveFeedback] = useArchiveFeedbackMutation();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleArchive = async (id: string) => {
    if (loadingIds?.includes(id)) return;

    setLoadingIds((prev) => [...prev, id]);
    const payload = {
      process_id: processId,
      feedback_ids: [id],
    };

    archiveFeedback(payload)
      .unwrap()
      .finally(() => {
        setLoadingIds((prev) => prev.filter((current) => current !== id));
      });
  };

  return (
    <div>
      <div className='f-14-400 text-GRAY_1000'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <div key={item?.id} className='flex items-start gap-2 select-none'>
              <div className='h-3 w-3 rounded-full border-3 border-blue-400 bg-blue-700'></div>
              <div className='min-w-0 flex-1'>
                <div className='f-12-450 text-gray-1000 truncate'>{item?.title}</div>
                <div className='f-11-450 mt-1 truncate text-gray-700'>{item?.initiated_by}</div>
              </div>
              {loadingIds.includes(item?.id) ? (
                <Loader size={12} className='mt-1 animate-spin text-gray-700' aria-label='Archiving...' />
              ) : (
                <Archive
                  onClick={() => handleArchive(item?.id)}
                  size={12}
                  className='mt-1 cursor-pointer'
                  aria-label='Archive feedback'
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusOpenBody;
