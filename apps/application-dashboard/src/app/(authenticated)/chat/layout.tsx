import type { ReactNode } from 'react';
import ChatSidebar from '@/modules/macs/components/chat/ChatSidebar';
import ChatNavbar from '@/modules/macs/components/ChatNavbar';
import { ChatSidebarProvider } from '@/modules/macs/context/ChatSidebarContext';

interface ChatLayoutProps {
  children: ReactNode;
  searchParams: Promise<{ s?: string }>;
}

const ChatLayout = async ({ children, searchParams }: ChatLayoutProps) => {
  const params = await searchParams;
  const conversationId = params?.s ?? null;

  return (
    <ChatSidebarProvider>
      <div className='flex h-full w-full overflow-hidden'>
        <ChatSidebar initialConversationId={conversationId} />
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <ChatNavbar />
          <main className='flex min-h-0 flex-1 px-2'>
            <section className='border-GRAY_400 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
              {children}
            </section>
          </main>
        </div>
      </div>
    </ChatSidebarProvider>
  );
};

export default ChatLayout;
