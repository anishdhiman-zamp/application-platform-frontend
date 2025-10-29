import { type FC, useState } from 'react';
import { Button, Checkbox } from '@zamp-platform/ui';
import Image from 'next/image';
import { useApplyFeedbackMutation } from '@/apis/feedback';
import { PLAY_ICON } from '@/constants/icons';
import { ArchiveFeedbackPayloadType, FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusQueuedBodyProps {
  items: FeedbackItemType[];
  processId: string;
}

const FeedbackStatusQueuedBody: FC<FeedbackStatusQueuedBodyProps> = ({ items, processId }) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [applyFeedback] = useApplyFeedbackMutation();

  const handleSelect = (item: FeedbackItemType) => {
    if (selectedItemIds.has(item?.id)) {
      setSelectedItemIds((prev) => {
        const newSet = new Set(prev);

        newSet.delete(item?.id);

        return newSet;
      });
    } else {
      setSelectedItemIds((prev) => new Set(prev).add(item?.id));
    }
  };

  const handleApply = () => {
    const payload: ArchiveFeedbackPayloadType = {
      process_id: processId,
      feedback_ids: Array.from(selectedItemIds),
    };

    if (selectedItemIds.size === 0) {
      payload.feedback_ids = items?.map((item) => item.id) ?? [];
    }

    applyFeedback(payload)
      .unwrap()
      .finally(() => {
        setSelectedItemIds(new Set());
      });
  };

  return (
    <div>
      <div className='f-14-400 text-GRAY_700'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <div
              key={item?.id}
              onClick={() => handleSelect(item)}
              className='flex cursor-pointer items-start gap-2 select-none'
            >
              <Checkbox checked={selectedItemIds.has(item?.id)} className='mt-1 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <div className='f-12-450 text-gray-1000 truncate'>{item?.title}</div>
                <div className='f-11-450 mt-1 truncate text-xs text-gray-700'>{item?.initiated_by}</div>
              </div>
            </div>
          ))}
        </div>
        <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
          <div>
            {selectedItemIds.size > 0
              ? `${selectedItemIds.size} Feedback selected`
              : 'Select feedback to test only some of them'}
          </div>
          <Button size='small' onClick={handleApply}>
            <div className='flex items-center gap-1'>
              <Image src={PLAY_ICON} alt='play' width={12} height={12} />
              {selectedItemIds.size > 0 ? `Apply these ${selectedItemIds.size}` : 'Apply All'}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusQueuedBody;
