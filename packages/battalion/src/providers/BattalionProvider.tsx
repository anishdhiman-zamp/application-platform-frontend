'use client';

import type { EventBusInterface } from '@zamp-platform/utils';
import React, { createContext, ReactNode, useContext } from 'react';

interface BattalionContextType {
  eventBus?: EventBusInterface;
}

const BattalionContext = createContext<BattalionContextType>({});

interface BattalionProviderProps {
  children: ReactNode;
  eventBus?: EventBusInterface;
}

export const BattalionProvider: React.FC<BattalionProviderProps> = ({ children, eventBus }) => {
  return <BattalionContext.Provider value={{ eventBus }}>{children}</BattalionContext.Provider>;
};

export const useBattalionContext = (): BattalionContextType => {
  return useContext(BattalionContext);
};
