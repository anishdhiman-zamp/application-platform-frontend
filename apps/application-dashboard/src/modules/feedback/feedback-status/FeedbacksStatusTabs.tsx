import { type FC, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { createTabsConfig, FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { TabConfig } from 'modules/feedback/feedback.types';
import { RootState } from '@/store';

interface FeedbacksStatusTabsProps {
  activeTab: FEEDBACK_STATUS;
  setActiveTab: (tab: FEEDBACK_STATUS) => void;
}

const FeedbacksStatusTabs: FC<FeedbacksStatusTabsProps> = ({ activeTab, setActiveTab }) => {
  const { successFeedbackItems, processingFeedbackItems, queuedFeedbackItems, openFeedbackItems } = useSelector(
    (state: RootState) => state?.feedbacks,
  );
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
      setActiveTab(newTab);
    },
    [setActiveTab],
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

  const tabsConfig: TabConfig[] = useMemo(
    () =>
      createTabsConfig({
        openFeedbackItems,
        queuedFeedbackItems,
        processingFeedbackItems,
        successFeedbackItems,
      }),
    [openFeedbackItems, queuedFeedbackItems, processingFeedbackItems, successFeedbackItems],
  );

  //temp commented
  // useEffect(() => {
  //   const lengthByTab = {
  //     [FEEDBACK_STATUS.OPEN]: openFeedbackItems.length,
  //     [FEEDBACK_STATUS.QUEUED]: queuedFeedbackItems.length,
  //     [FEEDBACK_STATUS.PROCESSING]: processingFeedbackItems.length,
  //     [FEEDBACK_STATUS.APPLIED]: successFeedbackItems.length,
  //   } as const;
  //   const currentLen = lengthByTab[validTab as keyof typeof lengthByTab];

  //   if (currentLen === 0) {
  //     const firstWithItems = tabsConfig.find((t) => t.items.length > 0);

  //     if (firstWithItems && firstWithItems.value !== validTab) {
  //       setActiveTabCallback(firstWithItems.value);
  //     }
  //   }
  // }, [
  //   validTab,
  //   openFeedbackItems.length,
  //   queuedFeedbackItems.length,
  //   processingFeedbackItems.length,
  //   successFeedbackItems.length,
  //   tabsConfig,
  //   setActiveTabCallback,
  // ]);

  return (
    <div className='shadow-menu-shadow border-0.5 border-GRAY_500 rounded-2.5 w-full max-w-full overflow-hidden bg-white'>
      <Tabs value={validTab} onValueChange={handleTabChange} className='w-full'>
        <div className='w-full overflow-scroll border-b border-gray-400 px-2 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          <TabsList className='h-auto gap-2.5 bg-transparent p-0'>
            {tabsConfig.map(
              (tab) =>
                !!tab.items.length && (
                  <TabsTrigger key={tab.value} value={tab.value} className={tab.className}>
                    <div className='flex items-center gap-1'>
                      {tab.icon}
                      <div className='f-12-500'>
                        {tab.label} <span className='text-GRAY_600 f-12-500'>{tab.items.length}</span>
                      </div>
                    </div>
                  </TabsTrigger>
                ),
            )}
          </TabsList>
        </div>

        {tabsConfig.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className='mt-0'>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FeedbacksStatusTabs;
