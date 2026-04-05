'use client';

import { useContext } from 'react';

import { type TaskState, TaskStateContext } from '../provider/TaskStateContext';

export function useTaskState(): TaskState {
  const context = useContext(TaskStateContext);
  if (!context) {
    throw new Error('useTaskState must be used within a TaskProvider');
  }
  return context;
}
