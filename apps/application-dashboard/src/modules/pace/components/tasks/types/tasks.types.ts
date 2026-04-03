import type { TaskStatus } from '@zamp-platform/chat';

export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks?: SubTask[];
}

export interface TaskCreator {
  id: string;
  name: string;
  avatar_type?: string;
  avatar_value?: string;
}

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  subtasks: SubTask[];
  skills_invoked_count: number;
  created_by: TaskCreator;
  created_at: string;
}

export interface TaskListByStatusResponse {
  tasks: TaskListItem[];
  count: number;
  page: number;
  limit: number;
}

export interface TaskStatusCount {
  status: TaskStatus;
  count: number;
}

export interface TaskListingCountsResponse {
  counts: TaskStatusCount[];
  total: number;
}

export interface TaskListByStatusRequest {
  status: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
  creation_source_type?: CreationSourceType;
  creation_source_id?: string;
}

export enum CREATION_SOURCE_TYPE {
  CONVERSATION = 'CONVERSATION',
  TASK = 'TASK',
}

export type CreationSourceType = CREATION_SOURCE_TYPE;

export type GetTaskCountsRequest =
  | {
      search?: string;
      creation_source_type?: CreationSourceType;
      creation_source_id?: string;
    }
  | void
  | TaskListByStatusRequest;

export interface CreationSource {
  type: CreationSourceType;
  id: string;
}

export const TASK_LISTING_TAB = {
  ALL: 'all',
  NEEDS_ACTION: 'needs_action',
} as const;

export type TaskListingTab = (typeof TASK_LISTING_TAB)[keyof typeof TASK_LISTING_TAB];
