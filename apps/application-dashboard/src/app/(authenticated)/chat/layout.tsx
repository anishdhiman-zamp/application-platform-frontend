import type { ReactNode } from 'react';
import ChatShell from '@/modules/macs/components/ChatShell';
import { MacsProvider } from '@/modules/macs/context/MacsContext';

const ChatLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex h-full w-full'>
      <ChatShell>{children}</ChatShell>
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
