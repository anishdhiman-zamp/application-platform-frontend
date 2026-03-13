import { type FC, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { useRouter } from 'next/navigation';
import { useApplyFeedbackMutation, useLazyGetFeedbacksQuery } from '@/apis/feedback';
import { ArchiveFeedbackPayloadType, FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackReapplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  processId: string;
}

const FeedbackReapplyDialog: FC<FeedbackReapplyDialogProps> = ({
  open,
  onOpenChange,
  selectedFeedbackItems,
  processingFeedbackItems,
  processId,
}) => {
  const router = useRouter();
  const [yetToBeAppliedExpanded, setYetToBeAppliedExpanded] = useState(true);
  const [processingExpanded, setProcessingExpanded] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedFeedbackItems.map((item) => item.id)));

  const [applyFeedback, { isLoading: isApplying }] = useApplyFeedbackMutation();
  const [getFeedbacks, { isFetching: isGettingFeedbacks }] = useLazyGetFeedbacksQuery();

  const { totalSelectedProcessingCount, totalSelectedYetToBeAppliedCount } = useMemo(() => {
    return {
      totalSelectedProcessingCount: processingFeedbackItems.filter((item) => selectedIds.has(item.id)).length,
      totalSelectedYetToBeAppliedCount: selectedFeedbackItems.filter((item) => selectedIds.has(item.id)).length,
    };
  }, [selectedIds]);

  const handleDialogApply = () => {
    const payload: ArchiveFeedbackPayloadType = {
      process_id: processId,
      feedback_ids: Array.from(selectedIds),
    };

    applyFeedback(payload)
      .unwrap()
      .then(() => {
        getFeedbacks({ process_id: processId })
          .unwrap()
          .then(() => {
            router.push(`${window.location.pathname}?tab=${FEEDBACK_STATUS.PROCESSING}`);
            onOpenChange(false);
          });
      });
  };

  const handleToggleSelection = (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }

      return newSet;
    });
  };

  const allowApply = useMemo(() => {
    // check if any item is selected from selectedFeedbackItems
    return selectedFeedbackItems.some((item) => selectedIds.has(item.id));
  }, [selectedIds, selectedFeedbackItems]);

  useEffect(() => {
    setSelectedIds(
      new Set([...processingFeedbackItems.map((item) => item.id), ...selectedFeedbackItems.map((item) => item.id)]),
    );
  }, [processingFeedbackItems, selectedFeedbackItems, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size='medium'
        showCloseButton
        className='z-[1005] max-w-[640px]'
        dialogueOverlayClassName='z-[1004]'
      >
        <DialogHeader className='mt-5 h-5 border-none px-5'>
          <DialogHeaderTitle>You'll need to reapply feedback from processing</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='mt-1 px-5 pb-5'>
          <div className='f-13-400 text-GRAY_700 mb-4'>Reapply from the list if needed.</div>
          <div className='bg-BG_GRAY_2 border-GRAY_400 flex flex-col gap-3 rounded-lg border border-dashed p-4'>
            {selectedFeedbackItems.length > 0 && (
              <div>
                <Button
                  type='button'
                  variant='ghost'
                  size='small'
                  onClick={() => setYetToBeAppliedExpanded(!yetToBeAppliedExpanded)}
                  className='f-14-500 text-GRAY_900 mb-2 flex w-full items-center justify-start gap-1 px-0 hover:bg-transparent'
                  data-testid='feedback-reapply-toggle-yet-to-be-applied'
                  aria-expanded={yetToBeAppliedExpanded}
                  aria-controls='feedback-reapply-yet-to-be-applied-panel'
                >
                  {yetToBeAppliedExpanded ? (
                    <ChevronDown size={16} className='text-GRAY_700' />
                  ) : (
                    <ChevronRight size={16} className='text-GRAY_700' />
                  )}
                  <span>
                    Yet to be applied
                    {totalSelectedYetToBeAppliedCount > 0 && (
                      <span className='ml-1'>{totalSelectedYetToBeAppliedCount}</span>
                    )}
                  </span>
                </Button>
                {yetToBeAppliedExpanded && (
                  <div id='feedback-reapply-yet-to-be-applied-panel' className='flex flex-col gap-3 px-5'>
                    {selectedFeedbackItems.map((item) => (
                      <FeedbackListCard
                        key={item.id}
                        icon={
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            className='mt-1 flex-shrink-0'
                            onClick={(e) => handleToggleSelection(e, item.id)}
                            id='check-feedback'
                          />
                        }
                        feedback={item}
                        initiatedBy={item.initiated_by}
                        timePrefix='Started'
                        withoutLinkWrapper
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {processingFeedbackItems.length > 0 && (
              <div className=''>
                <Button
                  type='button'
                  variant='ghost'
                  size='small'
                  onClick={() => setProcessingExpanded(!processingExpanded)}
                  className='f-14-500 text-GRAY_900 mb-2 flex w-full items-center justify-start gap-1 px-0 hover:bg-transparent'
                  data-testid='feedback-reapply-toggle-processing'
                  aria-expanded={processingExpanded}
                  aria-controls='feedback-reapply-processing-panel'
                >
                  {processingExpanded ? (
                    <ChevronDown size={16} className='text-GRAY_700' />
                  ) : (
                    <ChevronRight size={16} className='text-GRAY_700' />
                  )}
                  <span>
                    Processing
                    {totalSelectedProcessingCount > 0 && <span className='ml-1'>{totalSelectedProcessingCount}</span>}
                  </span>
                </Button>
                {processingExpanded && (
                  <div id='feedback-reapply-processing-panel' className='flex flex-col gap-3 px-5'>
                    {processingFeedbackItems.map((item) => (
                      <FeedbackListCard
                        key={item.id}
                        icon={
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            className='mt-1 flex-shrink-0'
                            onClick={(e) => handleToggleSelection(e, item.id)}
                            id='check-feedback'
                          />
                        }
                        feedback={item}
                        initiatedBy={item.initiated_by}
                        timePrefix='Started'
                        withoutLinkWrapper
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter className='flex items-center justify-end gap-3'>
          <DialogClose asChild>
            <Button variant='outline' size='medium'>
              Cancel
            </Button>
          </DialogClose>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant='default'
                  size='medium'
                  className='min-w-[126px]'
                  onClick={handleDialogApply}
                  isLoading={isApplying || isGettingFeedbacks}
                  disabled={!allowApply}
                >
                  Apply {allowApply ? selectedIds.size : ''} feedback
                </Button>
              </TooltipTrigger>
              {!allowApply && (
                <TooltipContent>
                  Please select at least one item from yet to be applied to apply feedback.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackReapplyDialog;
