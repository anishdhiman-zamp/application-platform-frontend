'use client';

import { BookTextIcon, HomeIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useChatSidebarContext } from '@/modules/macs/context/ChatSidebarContext';

const ChatNavbar = () => {
  const pathname = usePathname();
  const { setIsChatSidebarOpen } = useChatSidebarContext();

  const isHomePage = pathname === ROUTES_PATH.CHAT;
  const isSkillsPage = pathname === ROUTES_PATH.CHAT_SKILLS;

  const handleHomeClick = () => {
    setIsChatSidebarOpen(false);
  };

  return (
    <div className='flex h-9 items-center gap-x-1.5 overflow-visible px-2 py-1.5'>
      <Link
        href={ROUTES_PATH.CHAT}
        className={cn(
          'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-white',
          isHomePage && 'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border bg-white',
        )}
        role='button'
        tabIndex={0}
        onClick={handleHomeClick}
      >
        <HomeIcon size={14} />
      </Link>

      <Link
        href={isSkillsPage ? ROUTES_PATH.CHAT : ROUTES_PATH.CHAT_SKILLS}
        className={cn(
          'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 items-center justify-center rounded-lg p-2',
          isSkillsPage &&
            'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border bg-white hover:bg-white',
        )}
      >
        <BookTextIcon size={14} />
      </Link>
    </div>
  );
};

export default ChatNavbar;
