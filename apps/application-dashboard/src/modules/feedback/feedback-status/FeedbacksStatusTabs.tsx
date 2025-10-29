import { type FC, useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { Archive, ChartNoAxesColumn, Check, Loader } from 'lucide-react';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import FeedbackStatusArchivedBody from 'modules/feedback/feedback-status/FeedbackStatusArchivedBody';
import FeedbackStatusOpenBody from 'modules/feedback/feedback-status/FeedbackStatusOpenBody';
import FeedbackStatusProcessingBody from 'modules/feedback/feedback-status/FeedbackStatusProcessingBody';
import FeedbackStatusQueuedBody from 'modules/feedback/feedback-status/FeedbackStatusQueuedBody';
import FeedbackStatusSuccessBody from 'modules/feedback/feedback-status/FeedbackStatusSuccessBody';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbacksStatusTabsProps {
  processId: string;
  successFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  queuedFeedbackItems: FeedbackItemType[];
  archivedFeedbackItems: FeedbackItemType[];
  openFeedbackItems: FeedbackItemType[];
}

const FeedbacksStatusTabs: FC<FeedbacksStatusTabsProps> = ({
  processId,
  successFeedbackItems,
  processingFeedbackItems,
  queuedFeedbackItems,
  archivedFeedbackItems,
  openFeedbackItems,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = (searchParams?.get('tab') as FEEDBACK_STATUS) || FEEDBACK_STATUS.OPEN;
  const [activeTab, setActiveTab] = useState<FEEDBACK_STATUS>(defaultTab);

  const validTab = [
    FEEDBACK_STATUS.PROCESSING,
    FEEDBACK_STATUS.APPLIED,
    FEEDBACK_STATUS.OPEN,
    FEEDBACK_STATUS.QUEUED,
    FEEDBACK_STATUS.ARCHIVED,
  ].includes(activeTab)
    ? activeTab
    : FEEDBACK_STATUS.OPEN;

  const setActiveTabCallback = useCallback(
    (newTab: FEEDBACK_STATUS) => {
      setActiveTab((prev: FEEDBACK_STATUS) => (prev === newTab ? prev : newTab));
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (activeTab !== validTab) {
      setActiveTabCallback(validTab);
    }
  }, [activeTab, validTab]);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTabCallback(value as FEEDBACK_STATUS);
    },
    [setActiveTabCallback],
  );

  return (
    <div className='border-0.5 border-GRAY_500 rounded-3.5 shadow-table-filter-menu w-full max-w-full overflow-hidden bg-white'>
      <Tabs value={validTab} onValueChange={handleTabChange} className='w-full'>
        <div className='w-full overflow-scroll border-b border-gray-400 px-2 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          <TabsList className='h-auto gap-2.5 bg-transparent p-0'>
            {!!openFeedbackItems.length && (
              <TabsTrigger
                value={FEEDBACK_STATUS.OPEN}
                className='data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 !border !border-none px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0'
              >
                <div className='flex items-center gap-1'>
                  <div className='h-3 w-3 rounded-full border-3 border-blue-400 bg-blue-700'></div>
                  <div className='f-12-500'>
                    Open <span className='text-GRAY_600 f-12-500'>{openFeedbackItems?.length}</span>
                  </div>
                </div>
              </TabsTrigger>
            )}
            {!!queuedFeedbackItems.length && (
              <TabsTrigger
                value={FEEDBACK_STATUS.QUEUED}
                className='data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 !border !border-none px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0'
              >
                <div className='flex items-center gap-1'>
                  <ChartNoAxesColumn size={12} className='rotate-90' />
                  <div className='f-12-500'>
                    Queued feedback <span className='text-GRAY_600 f-12-500'>{queuedFeedbackItems?.length}</span>
                  </div>
                </div>
              </TabsTrigger>
            )}
            {!!processingFeedbackItems.length && (
              <TabsTrigger
                value={FEEDBACK_STATUS.PROCESSING}
                className='data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 border !border-white px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0'
              >
                <div className='flex items-center gap-1'>
                  <Loader size={12} />
                  <div className='f-12-500'>
                    Processing <span className='text-GRAY_600 f-12-500'>{processingFeedbackItems?.length}</span>
                  </div>
                </div>
              </TabsTrigger>
            )}
            {!!successFeedbackItems.length && (
              <TabsTrigger
                value={FEEDBACK_STATUS.APPLIED}
                className='data-[state=active]:text-GRAY_1000 h-6 border !border-white px-2 py-1 text-[#BC5910] !ring-0 !outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-orange-200'
              >
                <div className='flex items-center gap-1'>
                  <Check size={12} />
                  <div className='f-12-500'>
                    Ready for review <span className='text-GRAY_600 f-12-500'>{successFeedbackItems?.length}</span>
                  </div>
                </div>
              </TabsTrigger>
            )}
            {!!archivedFeedbackItems.length && (
              <TabsTrigger
                value={FEEDBACK_STATUS.ARCHIVED}
                className='data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 border !border-white px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0'
              >
                <div className='flex items-center gap-1'>
                  <Archive size={12} />
                  <div className='f-12-500'>
                    Archived <span className='text-GRAY_600 f-12-500'>{archivedFeedbackItems?.length}</span>
                  </div>
                </div>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value={FEEDBACK_STATUS.OPEN} className='mt-0'>
          <FeedbackStatusOpenBody processId={processId} items={openFeedbackItems} />
        </TabsContent>

        <TabsContent value={FEEDBACK_STATUS.QUEUED} className='mt-0'>
          <FeedbackStatusQueuedBody processId={processId} items={queuedFeedbackItems} />
        </TabsContent>

        <TabsContent value={FEEDBACK_STATUS.PROCESSING} className='mt-0'>
          <FeedbackStatusProcessingBody items={processingFeedbackItems} />
        </TabsContent>

        <TabsContent value={FEEDBACK_STATUS.APPLIED} className='mt-0'>
          <FeedbackStatusSuccessBody items={successFeedbackItems} />
        </TabsContent>

        <TabsContent value={FEEDBACK_STATUS.ARCHIVED} className='mt-0'>
          <FeedbackStatusArchivedBody processId={processId} items={archivedFeedbackItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbacksStatusTabs;
