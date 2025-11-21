import { type FC, useMemo, useState } from 'react';
import { Button, Checkbox } from '@zamp-platform/ui';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApplyFeedbackMutation, useLazyGetFeedbacksQuery } from '@/apis/feedback';
import { PLAY_ICON } from '@/constants/icons';
import FeedbackReapplyDialog from '@/modules/feedback/components/FeedbackReapplyDialog';
import { useFeedbackContextStore } from '@/modules/feedback/feedback-status/feedback.context';
import { ArchiveFeedbackPayloadType, FeedbackItemType } from '@/types/api/feedbacks.types';

const FeedbackStatusQueuedBody: FC = () => {
  const router = useRouter();
  const { state } = useFeedbackContextStore();
  const { queuedFeedbackItems: items, processId, processingFeedbackItems } = state;
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [applyFeedback, { isLoading: isApplying }] = useApplyFeedbackMutation();
  const [getFeedbacks, { isFetching: isGettingFeedbacks }] = useLazyGetFeedbacksQuery();

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
    if (processingFeedbackItems.length === 0) {
      const selectedIds = selectedItemIds.size > 0 ? Array.from(selectedItemIds) : items.map((item) => item?.id);

      handleDialogApply(selectedIds);

      return;
    }
    setIsDialogOpen(true);
  };

  const handleDialogApply = (selectedIds: string[]) => {
    const payload: ArchiveFeedbackPayloadType = {
      process_id: processId,
      feedback_ids: selectedIds,
    };

    applyFeedback(payload)
      .unwrap()
      .then(() => {
        getFeedbacks({ process_id: processId })
          .unwrap()
          .then(() => {
            router.push(`${window.location.pathname}?tab=${FEEDBACK_STATUS.PROCESSING}`);
            setSelectedItemIds(new Set());
          });
      });
  };

  const selectedFeedbackItems = useMemo(() => {
    return selectedItemIds.size > 0 ? items.filter((item) => selectedItemIds.has(item.id)) : items;
  }, [selectedItemIds, items]);

  const handleCheck = (e: React.MouseEvent<HTMLButtonElement>, item: FeedbackItemType) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(item);
  };

  return (
    <div>
      <div className='f-14-400 text-gray-1000 max-h-[400px] overflow-y-auto'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <FeedbackListCard
              key={item?.id}
              icon={
                <Checkbox
                  checked={selectedItemIds.has(item?.id)}
                  className='mt-1 flex-shrink-0'
                  onClick={(e) => handleCheck(e, item)}
                  id='check-feedback'
                />
              }
              feedback={item}
              initiatedBy={item?.initiated_by}
              processId={processId}
              allowDelete
            />
          ))}
        </div>
        <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
          <div className='text-GRAY_700'>Select feedback to test only some of them</div>
          <Button size='small' className='min-w-24' onClick={handleApply} isLoading={isApplying || isGettingFeedbacks}>
            <div className='flex items-center gap-1'>
              <Image src={PLAY_ICON} alt='play' width={12} height={12} />
              {selectedItemIds.size > 0 ? `Apply ${selectedItemIds.size} feedback` : 'Apply All'}
            </div>
          </Button>
        </div>
      </div>
      <FeedbackReapplyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedFeedbackItems={selectedFeedbackItems}
        processingFeedbackItems={processingFeedbackItems}
        processId={processId}
      />
    </div>
  );
};

export default FeedbackStatusQueuedBody;
