import type { ReactNode } from 'react';
import ChatSidebar from '@/modules/macs/components/chat/ChatSidebar';
import ChatNavbar from '@/modules/macs/components/ChatNavbar';
import { ChatProvider } from '@/modules/macs/context/ChatContext';

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ChatProvider>
      <div className='flex h-full w-full overflow-hidden'>
        <ChatSidebar />
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <ChatNavbar />
          <main className='flex min-h-0 flex-1 px-2'>
            <section className='border-GRAY_400 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
              {children}
            </section>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatLayout;
