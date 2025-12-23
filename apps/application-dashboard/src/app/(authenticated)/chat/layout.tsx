import type { ReactNode } from 'react';
import ChatShell from '@/modules/macs/components/ChatShell';
import { MacsProvider } from '@/modules/macs/context/MacsContext';

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MacsProvider>
      <div className='flex h-full w-full'>
        <ChatShell>{children}</ChatShell>
      </div>
    </MacsProvider>
  );
};

export default ChatLayout;
