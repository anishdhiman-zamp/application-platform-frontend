'use client';

import { type ReactNode } from 'react';
import ChatTopbar from '@/modules/macs/components/ChatTopbar';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import { MacsProvider, useMacsContext } from '@/modules/macs/context/MacsContext';

const MacsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { hasTabs, chatPanelSize } = useMacsContext();

  return (
    <div className='flex h-full w-full flex-col'>
      {/* Topbar row */}
      <div className='flex w-full'>
        {hasTabs ? (
          <>
            <ChatTopbar
              className='border-r border-gray-400'
              style={{ width: `${chatPanelSize}%` }}
              showExpandMinimize
            />
            <MacsTopbar style={{ width: `${100 - chatPanelSize}%` }} />
          </>
        ) : (
          <MacsTopbar className='w-full' />
        )}
      </div>

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
