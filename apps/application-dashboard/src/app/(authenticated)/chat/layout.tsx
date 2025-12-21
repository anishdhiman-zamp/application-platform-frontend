import type { ReactNode } from 'react';
import ChatShell from '@/modules/macs/components/ChatShell';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import { MacsProvider } from '@/modules/macs/context/MacsContext';

const ChatLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <MacsTopbar />
      <div className='min-h-0 flex-1'>
        <ChatShell>{children}</ChatShell>
      </div>
    </div>
  );
};

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MacsProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </MacsProvider>
  );
};

export default ChatLayout;
