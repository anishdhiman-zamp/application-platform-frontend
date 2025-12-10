import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { MessageSquare } from 'lucide-react';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import TooltipV2 from '@/components/common/TooltipV2';
import { RootState } from '@/store';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface DraftFeedbackButtonProps {
  processId?: string;
}

const DraftFeedbackButton: FC<DraftFeedbackButtonProps> = ({ processId = '' }) => {
  const openFeedbackConversations = useSelector((state: RootState) => state?.feedbacks?.openFeedbackConversations);

  if (openFeedbackConversations?.length === 0) {
    return null;
  }

  return (
    <Popover key={`${processId}-draft-feedback-button`}>
      <TooltipV2 tooltipBody='All chats' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
        <PopoverTrigger asChild>
          <Button id='draft-feedback-btn' size='small' variant='secondary'>
            <MessageSquare size={12} />
          </Button>
        </PopoverTrigger>
      </TooltipV2>
      <PopoverContent align='end' className='shadow-menu-shadow border-0.5 border-GRAY_500 w-[400px] max-w-[90vw] p-0'>
        <div className='f-14-400 text-GRAY_1000 max-h-[400px] overflow-y-auto'>
          <div className='flex flex-col gap-3 p-3'>
            {openFeedbackConversations?.map((item) => (
              <FeedbackListCard
                key={item?.id}
                feedback={item}
                initiatedBy={item?.initiated_by}
                processId={processId}
                allowDelete
                isDraftFeedback
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DraftFeedbackButton;
