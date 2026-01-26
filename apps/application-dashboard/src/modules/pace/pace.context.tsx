'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface PaceContextType {
  isPaceSidebarOpen: boolean;
  setIsPaceSidebarOpen: (open: boolean) => void;
  registerStartNewChat: (callback: () => void) => void;
  startNewChat: () => void;
}

const PaceContext = createContext<PaceContextType | null>(null);

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const [isPaceSidebarOpen, setIsPaceSidebarOpen] = useState(false);
  const startNewChatRef = useRef<(() => void) | null>(null);

  const registerStartNewChat = useCallback((callback: () => void) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const value: PaceContextType = useMemo(
    () => ({
      isPaceSidebarOpen,
      setIsPaceSidebarOpen,
      registerStartNewChat,
      startNewChat,
    }),
    [isPaceSidebarOpen, registerStartNewChat, startNewChat],
  );

  return <PaceContext.Provider value={value}>{children}</PaceContext.Provider>;
};

export const usePaceContext = () => {
  const context = useContext(PaceContext);

  if (!context) {
    throw new Error('usePaceContext must be used within a PaceProvider');
  }

  return context;
};

export default PaceContext;
