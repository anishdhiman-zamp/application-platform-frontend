import { FC, ReactNode } from 'react';
import ChatSidebar from 'modules/pace/components/layout/chat-sidebar/ChatSidebar';
import PaceNavbar from 'modules/pace/components/layout/PaceNavbar';

interface PaceLayoutContentProps {
  children: ReactNode;
}

const PaceLayoutContent: FC<PaceLayoutContentProps> = ({ children }) => {
  return (
    <div className='bg-BG_GRAY_1 flex h-full w-full overflow-hidden'>
      <ChatSidebar />
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <PaceNavbar />
        <main className='flex min-h-0 flex-1 px-2'>
          <section className='border-GRAY_400 shadow-chat-section flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border bg-white'>
            {children}
          </section>
        </main>
      </div>
    </div>
  );
};

export default PaceLayoutContent;
