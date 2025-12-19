'use client';

import { type ReactNode } from 'react';
import ChatTopbar from '@/modules/macs/components/chat/ChatTopbar';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import { MacsProvider, useMacsContext } from '@/modules/macs/context/MacsContext';
import { useTopbarLayout } from '@/modules/macs/hooks/useTopbarLayout';
import { TopbarLayoutType } from '@/modules/macs/types';

const MacsLayoutContent = ({ children }: { children: ReactNode }) => {
  const topbarLayout = useTopbarLayout();
  const { hasChatMessages, showHistoryView } = useMacsContext();

  // Show ChatTopbar when there are messages OR when viewing history
  const showChatTopbar = hasChatMessages || showHistoryView;

  const renderTopbar = () => {
    switch (topbarLayout.type) {
      case TopbarLayoutType.Stacked:
        return (
          <div className='flex w-full flex-col items-center justify-center'>
            <MacsTopbar className='w-full' />
            {showChatTopbar && <ChatTopbar className='w-[700px]' />}
          </div>
        );
      case TopbarLayoutType.MacsOnly:
        return <MacsTopbar className='w-full' />;
      case TopbarLayoutType.Split:
        return (
          <>
            {showChatTopbar ? (
              <ChatTopbar style={{ width: topbarLayout.chatWidth }} showExpandMinimize />
            ) : (
              <div style={{ width: topbarLayout.chatWidth }} />
            )}
            <MacsTopbar className='border-l border-gray-400' style={{ width: topbarLayout.macsWidth }} />
          </>
        );
    }
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex w-full flex-shrink-0'>{renderTopbar()}</div>
      <div className='min-h-0 flex-1'>{children}</div>
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
