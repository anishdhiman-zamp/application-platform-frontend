'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { EventBusInterface } from './event-bus.types';

export interface EventBusContextType {
  sseEventBus: EventBusInterface;
}

interface EventBusProviderProps {
  children: ReactNode;
  eventBus: EventBusInterface;
}

const EventBusContext = createContext<EventBusContextType | undefined>(undefined);

export const EventBusProvider = ({ children, eventBus }: EventBusProviderProps) => {
  const value = useMemo<EventBusContextType>(() => ({ sseEventBus: eventBus }), [eventBus]);

  return <EventBusContext.Provider value={value}>{children}</EventBusContext.Provider>;
};

export const useEventBus = (): EventBusContextType => {
  const context = useContext(EventBusContext);

  if (!context) {
    throw new Error('useEventBus must be used within an EventBusProvider');
  }

  return context;
};
