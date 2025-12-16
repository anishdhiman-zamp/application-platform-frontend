'use client';

import { type ReactNode } from 'react';
import ChatTopbar from '@/modules/macs/components/ChatTopbar';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import { MacsProvider } from '@/modules/macs/context/MacsContext';
import { useTopbarLayout } from '@/modules/macs/hooks/useTopbarLayout';
import { TopbarLayoutType } from '@/modules/macs/types';

const MacsLayoutContent = ({ children }: { children: ReactNode }) => {
  const topbarLayout = useTopbarLayout();

  const renderTopbar = () => {
    switch (topbarLayout.type) {
      case TopbarLayoutType.ChatOnly:
        return <ChatTopbar className='w-full' showExpandMinimize />;
      case TopbarLayoutType.MacsOnly:
        return <MacsTopbar className='w-full' />;
      case TopbarLayoutType.Split:
        return (
          <>
            <ChatTopbar
              className='border-r border-gray-400'
              style={{ width: topbarLayout.chatWidth }}
              showExpandMinimize
            />
            <MacsTopbar style={{ width: topbarLayout.macsWidth }} />
          </>
        );
    }
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex w-full'>{renderTopbar()}</div>
      {children}
    </div>
  );
};

const MacsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MacsProvider>
      <MacsLayoutContent>{children}</MacsLayoutContent>
    </MacsProvider>
  );
};

export default MacsLayout;
