'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import ChatSidebar from '@/modules/macs/components/chat/ChatSidebar';
import ChatNavbar from '@/modules/macs/components/ChatNavbar';
import { ChatSidebarProvider } from '@/modules/macs/context/ChatSidebarContext';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  if (isLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isLoading && !isPaceChatEnabled) {
    notFound();
  }

  return (
    <ChatSidebarProvider>
      <div className='bg-BG_GRAY_1 flex h-full w-full overflow-hidden'>
        <ChatSidebar />
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <ChatNavbar />
          <main className='flex min-h-0 flex-1 px-2'>
            <section className='border-GRAY_400 shadow-chat-section flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border'>
              {children}
            </section>
          </main>
        </div>
      </div>
    </ChatSidebarProvider>
  );
};

export default ChatLayout;
