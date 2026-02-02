'use client';

import { Button } from '@zamp-platform/ui';
import { FC, ReactNode, useMemo } from 'react';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { usePaceContext } from '@/modules/pace/pace.context';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { usePathname } from 'next/navigation';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContent: FC<PaceLayoutContentProps> = ({ children }) => {
  const { isPaceSidebarOpen, setIsPaceSidebarOpen } = usePaceContext();
  const pathname = usePathname();

  const isPaceHome = useMemo(() => pathname === ROUTES_PATH.CHAT, [pathname]);

  const showFloatingButton = !isPaceSidebarOpen && !isPaceHome;

  return (
    <div className='bg-BG_GRAY_1 flex h-full w-full overflow-hidden'>
      <ChatSidebar />
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <PaceNavbar />
        <main className='flex min-h-0 flex-1 flex-col px-2'>
          <section className='border-GRAY_400 shadow-chat-section flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border bg-white'>
            {children}
          </section>
          {showFloatingButton && (
            <div className='flex h-20 shrink-0 items-center pl-3'>
              <Button
                onClick={() => setIsPaceSidebarOpen(true)}
                variant='secondary'
                size='icon'
                className='shadow-chat-section h-14 w-14 rounded-full border-none bg-white transition-all [&_svg]:size-10'
              >
                <NewPaceIcons />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PaceLayoutContent;
