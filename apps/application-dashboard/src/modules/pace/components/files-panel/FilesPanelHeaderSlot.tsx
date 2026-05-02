'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';

const FilesPanelHeaderSlotContext = createContext<HTMLElement | null>(null);

interface FilesPanelHeaderSlotProviderProps {
  children: ReactNode;
}

export const FilesPanelHeaderSlotProvider = ({ children }: FilesPanelHeaderSlotProviderProps) => {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <FilesPanelHeaderSlotContext.Provider value={slot}>
      <div ref={setSlot} className='shrink-0 empty:hidden' />
      {children}
    </FilesPanelHeaderSlotContext.Provider>
  );
};

export const useFilesPanelHeaderSlot = () => useContext(FilesPanelHeaderSlotContext);
