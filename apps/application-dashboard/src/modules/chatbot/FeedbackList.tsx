import { FC, useEffect, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { MessageSquare, Plus } from 'lucide-react';
import { doesUrlMatchLocation, getFeedbackItemConfig } from 'modules/chatbot/utils';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import { useSearchParams } from 'next/navigation';
import { FeedbackItemType, LocationData } from '@/types/api/feedbacks.types';

interface FeedbackListProps {
  children: React.ReactNode;
  items: FeedbackItemType[];
  processId: string;
  onOpenChatbot: (feedbackItem?: FeedbackItemType) => void;
  disableAddMoreFeedback?: boolean;
  onDeleteSuccess?: (feedbackId?: string) => void;
  hideFeedbackCount?: boolean;
  annotationLocation: LocationData;
}

const FeedbackList: FC<FeedbackListProps> = ({
  children,
  items = [],
  processId,
  onOpenChatbot,
  disableAddMoreFeedback = false,
  onDeleteSuccess,
  hideFeedbackCount = false,
  annotationLocation,
}) => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Check URL params on mount to determine if chatbot should be open
  useEffect(() => {
    if (searchParams && doesUrlMatchLocation(searchParams, annotationLocation)) {
      setIsOpen(true);
    }
  }, [searchParams, annotationLocation]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        {!hideFeedbackCount ? (
          <Button
            variant='outline'
            size='icon'
            className='bg-accent text-accent-foreground f-11-500 flex h-5 items-center gap-1 [&_svg]:size-3'
          >
            <MessageSquare />
            <span>{items.length}</span>
          </Button>
        ) : (
          children
        )}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className='w-[380px] space-y-1.5 border-none bg-transparent p-0 shadow-none'>
          <div className='rounded-xl border bg-white px-4 pt-3 pb-4' style={{ boxShadow: '0px 2px 8px 1px #41414114' }}>
            <div className='f-12-450 flex items-center gap-1 text-gray-700'>
              <span>Feedback on this field</span>
              <span>{items.length}</span>
            </div>
            <div className='mt-2 mb-3 space-y-1.5'>
              {items?.map((item) => (
                <FeedbackListCard
                  key={item?.id}
                  feedback={item}
                  initiatedBy={item?.initiated_by}
                  processId={processId}
                  onDeleteSuccess={() => onDeleteSuccess?.(item?.id)}
                  {...getFeedbackItemConfig(item as FeedbackItemType, onOpenChatbot)}
                />
              ))}
            </div>
            <Button
              variant='outline'
              size='xsmall'
              className='flex items-center gap-1.5 [&_svg]:size-3'
              onClick={() => onOpenChatbot()}
              disabled={disableAddMoreFeedback}
            >
              <Plus /> <span>Add more feedback</span>
            </Button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default FeedbackList;
