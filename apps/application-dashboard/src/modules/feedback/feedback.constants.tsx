import { ChartNoAxesColumn, Check, Loader } from 'lucide-react';
import { TabConfig } from 'modules/feedback/feedback.types';
import FeedbackStatusOpenBody from 'modules/feedback/feedback-status/FeedbackStatusOpenBody';
import FeedbackStatusProcessingBody from 'modules/feedback/feedback-status/FeedbackStatusProcessingBody';
import FeedbackStatusQueuedBody from 'modules/feedback/feedback-status/FeedbackStatusQueuedBody';
import FeedbackStatusSuccessBody from 'modules/feedback/feedback-status/FeedbackStatusSuccessBody';
import Image from 'next/image';
import { FEEDBACK_OPEN_ICON } from '@/constants/icons';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

export enum FEEDBACK_STATUS {
  OPEN = 'open',
  QUEUED = 'queued',
  APPLIED = 'applied',
  PROCESSING = 'processing',
  ARCHIVED = 'archived',
}

export enum SCOPE_TYPE {
  PROCESS = 'process',
  ACTIVITY_RUN = 'activity_run',
}

export enum LOCATION_TYPE {
  DATASET_FIELD = 'dataset_field',
  LOG = 'log',
  ACTIVITY_RUN = 'activity_run',
}

interface CreateTabsConfigParams {
  openFeedbackItems: FeedbackItemType[];
  queuedFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  successFeedbackItems: FeedbackItemType[];
}

export function createTabsConfig({
  openFeedbackItems,
  queuedFeedbackItems,
  processingFeedbackItems,
  successFeedbackItems,
}: CreateTabsConfigParams): TabConfig[] {
  return [
    {
      value: FEEDBACK_STATUS.OPEN,
      label: 'Open',
      icon: <Image src={FEEDBACK_OPEN_ICON} alt='feedback open' width={12} height={12} />,
      className:
        'data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 !border !border-none px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      component: <FeedbackStatusOpenBody />,
      items: openFeedbackItems,
    },
    {
      value: FEEDBACK_STATUS.QUEUED,
      label: 'Queued',
      icon: <ChartNoAxesColumn size={12} className='rotate-90' />,
      className:
        'data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 !border !border-none px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      component: <FeedbackStatusQueuedBody />,
      items: queuedFeedbackItems,
    },
    {
      value: FEEDBACK_STATUS.PROCESSING,
      label: 'Processing',
      icon: <Loader size={12} />,
      className:
        'data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 border !border-white px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      component: <FeedbackStatusProcessingBody />,
      items: processingFeedbackItems,
    },
    {
      value: FEEDBACK_STATUS.APPLIED,
      label: 'Applied',
      icon: <Check size={12} className='text-ORANGE_1000' />,
      className:
        'data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000 text-GRAY_900 h-6 border !border-white px-2 py-1 !ring-0 !outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
      component: <FeedbackStatusSuccessBody />,
      items: successFeedbackItems,
    },
  ];
}
