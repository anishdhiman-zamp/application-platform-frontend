'use client';

import { HomeIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import SectionIconButton from '@/modules/macs/components/SectionIconButton';
import { useChatContext } from '@/modules/macs/context/ChatContext';
import { SectionType } from '@/modules/macs/types';

interface ChatNavbarProps {
  className?: string;
}

const ChatNavbar = ({ className }: ChatNavbarProps) => {
  const pathname = usePathname();
  const { startNewChat } = useChatContext();

  const isHomePage = pathname === ROUTES_PATH.CHAT;

  const handleHomeClick = () => {
    startNewChat();
  };

  return (
    <div
      className={cn(
        'bg-BG_GRAY_1 border-GRAY_400 flex h-9 items-center gap-x-1.5 overflow-visible px-2 py-1',
        className,
      )}
    >
      <Link
        href={ROUTES_PATH.CHAT}
        className={cn(
          'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-white',
          isHomePage && 'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 border bg-white',
        )}
        onClick={handleHomeClick}
      >
        <HomeIcon size={14} />
      </Link>

      <SectionIconButton section={SectionType.Skills} />
    </div>
  );
};

export default ChatNavbar;
