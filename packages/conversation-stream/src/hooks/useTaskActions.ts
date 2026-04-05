'use client';

import { useContext } from 'react';

import { type TaskActions, TaskActionsContext } from '../provider/TaskActionsContext';

export function useTaskActions(): TaskActions {
  const context = useContext(TaskActionsContext);
  if (!context) {
    throw new Error('useTaskActions must be used within a TaskProvider');
  }
  return context;
}
