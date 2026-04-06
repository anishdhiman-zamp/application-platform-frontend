'use client';

import { createContext } from 'react';

export interface TaskActions {
  refetchHistory: () => void;
}

export const TaskActionsContext = createContext<TaskActions | null>(null);
