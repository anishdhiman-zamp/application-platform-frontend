import { ReactElement } from 'react';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

export type TabConfig = {
  value: FEEDBACK_STATUS;
  label: string;
  icon: ReactElement;
  className: string;
  component: ReactElement;
  items: FeedbackItemType[];
};
