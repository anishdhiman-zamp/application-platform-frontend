'use client';

import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import TaskListingPage from '@/modules/pace/components/tasks/components/TaskListingPage';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const TasksPane = () => {
  useDynamicTabs({ type: TAB_TYPE.TASK });

  return <TaskListingPage />;
};

export default TasksPane;
