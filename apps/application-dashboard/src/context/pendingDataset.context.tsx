'use client';

import React, { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { UNTITLED_DATASET_NAME } from '@/modules/data/data.constants';

interface PendingDatasetContextType {
  // Pending title for new datasets (not yet saved to backend)
  pendingTitle: string;
  setPendingTitle: (title: string) => void;
  // Clear pending data (call after dataset is created)
  clearPendingData: () => void;
  // Flag to auto-focus the title input in breadcrumb
  shouldAutoFocusTitle: boolean;
  setShouldAutoFocusTitle: (value: boolean) => void;
}

const PendingDatasetContext = createContext<PendingDatasetContextType | undefined>(undefined);

export const usePendingDatasetContext = () => {
  const context = useContext(PendingDatasetContext);

  if (!context) {
    const error = new Error('usePendingDatasetContext must be used within PendingDatasetProvider');

    captureException(error);
  }

  return context;
};

/**
 * Optional version - returns undefined if context is not available
 */
export const usePendingDatasetContextOptional = () => {
  return useContext(PendingDatasetContext);
};

interface PendingDatasetProviderProps {
  children: ReactNode;
}

export const PendingDatasetProvider: FC<PendingDatasetProviderProps> = ({ children }) => {
  const [pendingTitle, setPendingTitle] = useState<string>(UNTITLED_DATASET_NAME);
  const [shouldAutoFocusTitle, setShouldAutoFocusTitle] = useState<boolean>(false);

  const clearPendingData = useCallback(() => {
    setPendingTitle(UNTITLED_DATASET_NAME);
    setShouldAutoFocusTitle(false);
  }, []);

  const value = {
    pendingTitle,
    setPendingTitle,
    clearPendingData,
    shouldAutoFocusTitle,
    setShouldAutoFocusTitle,
  };

  return <PendingDatasetContext.Provider value={value}>{children}</PendingDatasetContext.Provider>;
};
