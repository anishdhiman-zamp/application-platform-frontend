import { TASK_STATUS, type TaskStatus } from '@zamp-platform/chat';
import type { LucideIcon } from 'lucide-react';
import { List, TrafficCone } from 'lucide-react';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';

export const STATUS_DISPLAY_ORDER: TaskStatus[] = [
  TASK_STATUS.NEEDS_INPUT,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.FAILED,
  TASK_STATUS.COMPLETED,
];

export const NEEDS_ACTION_STATUSES: TaskStatus[] = [TASK_STATUS.NEEDS_INPUT];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_STATUS.FAILED]: 'Failed',
  [TASK_STATUS.NEEDS_INPUT]: 'Needs input',
};

export const TAB_CONFIG: { id: TaskListingTab; label: string; icon: LucideIcon }[] = [
  { id: TASK_LISTING_TAB.ALL, label: 'All', icon: List },
  { id: TASK_LISTING_TAB.NEEDS_ACTION, label: 'Needs Action', icon: TrafficCone },
];

export const VALID_TABS = new Set<string>(Object.values(TASK_LISTING_TAB));

export const TASKS_PAGE_SIZE = 40;
export const SEARCH_DEBOUNCE_MS = 300;
