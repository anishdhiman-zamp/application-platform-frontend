'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import ChatShell from '@/modules/macs/components/ChatShell';
import { MacsProvider } from '@/modules/macs/context/MacsContext';

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  console.log('isPaceChatEnabled', isPaceChatEnabled);

  if (isLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isLoading && !isPaceChatEnabled) {
    notFound();
  }

  return (
    <MacsProvider>
      <div className='flex h-full w-full'>
        <ChatShell>{children}</ChatShell>
      </div>
    </MacsProvider>
  );
};

export default ChatLayout;
