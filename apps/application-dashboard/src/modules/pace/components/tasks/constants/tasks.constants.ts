import { TASK_STATUS, type TaskStatus } from '@zamp-platform/chat';
import type { LucideIcon } from 'lucide-react';
import { List, TrafficCone } from 'lucide-react';
import { TASK_LISTING_TAB, type TaskListingTab } from '@/modules/pace/components/tasks/types/tasks.types';

export const STATUS_DISPLAY_ORDER: TaskStatus[] = [
  TASK_STATUS.NEEDS_INPUT,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.FAILED,
  TASK_STATUS.CANCELED,
];

export const NEEDS_ACTION_STATUSES: TaskStatus[] = [TASK_STATUS.NEEDS_INPUT];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_STATUS.FAILED]: 'Failed',
  [TASK_STATUS.NEEDS_INPUT]: 'Needs input',
  [TASK_STATUS.CANCELED]: 'Canceled',
};

export const TAB_CONFIG: { id: TaskListingTab; label: string; icon: LucideIcon }[] = [
  { id: TASK_LISTING_TAB.ALL, label: 'All', icon: List },
  { id: TASK_LISTING_TAB.NEEDS_ACTION, label: 'Needs Action', icon: TrafficCone },
];

export const VALID_TABS = new Set<string>(Object.values(TASK_LISTING_TAB));

export const COMPLETED_STATUSES = new Set<string>([
  TASK_STATUS.COMPLETED,
  TASK_STATUS.FAILED,
  TASK_STATUS.CANCELED,
  TASK_STATUS.NEEDS_INPUT,
]);

export const STATUS_DISPLAY: Record<string, string> = {
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
  NEEDS_INPUT: 'Needs input',
  IN_PROGRESS: 'In progress',
};

export const TASKS_PAGE_SIZE = 40;
export const SEARCH_DEBOUNCE_MS = 300;

export const HITL_RESPONDED_EVENT = 'hitl_responded';
