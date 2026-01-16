'use client';

import type { ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { notFound } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ChatProvider, useChatContext } from '@/modules/pace/chat.context';
import ChatNavbar from '@/modules/pace/components/layout/ChatNavbar';
import ChatSidebar from '@/modules/pace/components/layout/ChatSidebar';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayoutContent = ({ children }: ChatLayoutProps) => {
  const { isExpanded } = useChatContext();

  return (
    <div className='bg-BG_GRAY_1 flex h-full w-full overflow-hidden'>
      <ChatSidebar />
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', isExpanded ? 'opacity-0' : 'opacity-100')}>
        <ChatNavbar />
        <main className='flex min-h-0 flex-1 px-2'>
          <section className='border-GRAY_400 shadow-chat-section flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border bg-white'>
            {children}
          </section>
        </main>
      </div>
    </div>
  );
};

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  if (isLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isLoading && !isPaceChatEnabled) {
    notFound();
  }

  return (
    <ChatProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatProvider>
  );
};

export default ChatLayout;
