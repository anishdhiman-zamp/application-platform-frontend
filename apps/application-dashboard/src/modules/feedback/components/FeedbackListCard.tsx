import { FC, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { ChevronDown } from 'lucide-react';
import FeedbackCard from 'modules/feedback/components/FeedbackCard';
import FeedbackDeleteDialog from 'modules/feedback/components/FeedbackDeleteDialog';
import Link from 'next/link';
import { createChatbotUrl } from '@/modules/chatbot/utils';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackListCardProps {
  feedback: FeedbackItemType;
  icon: React.ReactNode;
  initiatedBy: string;
  timePrefix?: string;
  processId?: string;
  onCheck?: () => void;
  allowDelete?: boolean;
  withoutLinkWrapper?: boolean;
}

const selectors = ['#delete-feedback', '#check-feedback'];

const FeedbackListCard: FC<FeedbackListCardProps> = (props) => {
  const { feedback, processId, allowDelete, withoutLinkWrapper = false } = props;
  const [confirmItem, setConfirmItem] = useState<boolean>(false);

  const handleFeedbackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;

    if (selectors.some((selector) => target.closest(selector))) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderFeedbackContent = () => {
    const feedbackCard = <FeedbackCard {...props} setConfirmItem={setConfirmItem} />;

    if (withoutLinkWrapper) {
      const shouldShowAccordion = !allowDelete && feedback?.summary?.feedback_points?.length;

      if (shouldShowAccordion) {
        return (
          <Accordion type='single' collapsible>
            <AccordionItem value='feedback-item' className='border-none'>
              <AccordionTrigger
                className='items-start p-0'
                icon={ChevronDown}
                iconRotation={180}
                useTooltip
                tooltipContent='View change logic'
              >
                {feedbackCard}
              </AccordionTrigger>
              <AccordionContent className='f-12-450 px-5 py-2 text-gray-900'>
                {feedback?.summary?.feedback_points?.join(' ') || ''}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }

      return feedbackCard;
    }

    return (
      <Link href={createChatbotUrl(feedback)} onClick={handleFeedbackClick} prefetch>
        {feedbackCard}
      </Link>
    );
  };

  return (
    <>
      {renderFeedbackContent()}
      {allowDelete && confirmItem && (
        <FeedbackDeleteDialog
          open={confirmItem}
          onOpenChange={(open) => !open && setConfirmItem(false)}
          feedback={feedback}
          processId={processId}
        />
      )}
    </>
  );
};

export default FeedbackListCard;
