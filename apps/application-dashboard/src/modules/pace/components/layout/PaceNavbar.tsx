'use client';

import { useCallback, useMemo, useRef } from 'react';
import { Button, FolderOpenIcon, MessageSquareIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { PanelRightOpen } from 'lucide-react';
import { FILES_PANEL_SPACER_TRANSITION, getNavbarAnimations, NO_ANIMATION } from 'modules/pace/pace.animations';
import type { AnimatedIconHandle } from 'modules/pace/pace.types';
import { CHAT_SIDEBAR_STATE, PaceNavbarItemId } from 'modules/pace/pace.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import DynamicTabsBar from '@/modules/pace/components/dynamic-tabs/DynamicTabsBar';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import NavbarIconLink from '@/modules/pace/components/layout/NavbarIconLink';
import { PACE_NAVBAR_ITEMS, SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    chatSidebarState,
    prevChatSidebarState,
    setChatSidebarState,
    collapseSidebar,
    filesPanelOpen,
    filesPanelPinned,
    setFilesPanelPinned,
    toggleFilesPanel,
    cancelFilesPanelClose,
    sidebarWidth,
    isSidebarResizing,
    filesPanelWidth,
    isFilesPanelResizing,
  } = usePaceContext();
  const { isOnAnyDynamicTab } = useDynamicTabs();

  const chatIconRef = useRef<AnimatedIconHandle>(null);

  const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isPinned = filesPanelOpen && filesPanelPinned;
  // Folder button occupies pl-2 (8px) + w-7.5 (30px) = 38px; subtract it so the spacer
  // stops where the button begins, keeping the button visually inside the files-panel column.
  const FOLDER_BUTTON_WIDTH_PX = 38;
  const filesPanelSpacerWidth = isPinned ? Math.max(0, filesPanelWidth - FOLDER_BUTTON_WIDTH_PX) : 0;

  const navAnimations = useMemo(
    () => getNavbarAnimations(prevChatSidebarState, chatSidebarState),
    [prevChatSidebarState, chatSidebarState],
  );

  const isNavItemActive = (id: PaceNavbarItemId, path: string) => {
    if (isExpanded) {
      return false;
    }

    if (isOnAnyDynamicTab()) {
      return false;
    }

    if (id === PaceNavbarItemId.SETTINGS) {
      return pathname?.startsWith(ROUTES_PATH.CHAT_SETTINGS) ?? false;
    }

    return pathname?.includes(path) ?? false;
  };

  const getNavItemHref = (path: string) => {
    const sParam = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM);

    if (sParam) {
      return `${path}?s=${sParam}`;
    }

    return path;
  };

  const handleChatIconClick = useCallback(() => {
    if (isCollapsed) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [isCollapsed, setChatSidebarState]);

  const handleChatIconDoubleClick = useCallback(() => {
    router.push(ROUTES_PATH.CHAT);
  }, [router]);

  const handleNavItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isExpanded) return;

      const href = e.currentTarget.getAttribute('href');

      if (!href) return;

      const targetUrl = new URL(href, window.location.origin);
      const targetRouteUrl = targetUrl.pathname + (targetUrl.search || '');
      const currentRouteUrl = window.location.pathname + (window.location.search || '');

      if (targetRouteUrl === currentRouteUrl) {
        collapseSidebar();
      }
    },
    [isExpanded, collapseSidebar],
  );

  return (
    <div className='bg-BG_GRAY_2 flex h-[42px] items-center overflow-hidden px-2 pt-1.5 pb-1.5'>
      {/* Icon slot: fixed size, both icons stacked, crossfade via opacity */}
      <div className='relative mr-2 h-7.5 w-7.5 shrink-0'>
        <motion.div
          initial={false}
          animate={{ opacity: isSidebar ? 1 : 0 }}
          transition={navAnimations.collapseIcon}
          className='absolute inset-0'
          style={{ pointerEvents: isSidebar ? 'auto' : 'none' }}
        >
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 shrink-0 rounded p-1.5 text-gray-900 hover:text-gray-900'
            onClick={collapseSidebar}
            title='Close sidebar'
          >
            <PanelRightOpen size={16} />
          </Button>
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: isSidebar ? 0 : 1 }}
          transition={navAnimations.chatIcon}
          className='absolute inset-0'
          style={{ pointerEvents: isSidebar ? 'none' : 'auto' }}
        >
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'text-GRAY_700 hover:text-GRAY_900 hover:bg-accent h-7.5 w-7.5 rounded-lg border-[0.75px] border-transparent p-[7px]',
              isExpanded &&
                'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
            )}
            onClick={handleChatIconClick}
            onDoubleClick={handleChatIconDoubleClick}
            onMouseEnter={() => chatIconRef.current?.startAnimation()}
            onMouseLeave={() => chatIconRef.current?.stopAnimation()}
          >
            <MessageSquareIcon ref={chatIconRef} size={16} className='pointer-events-none' />
          </Button>
        </motion.div>
      </div>

      {/* Spacer: animates width to push content when sidebar is open */}
      <motion.div
        initial={false}
        animate={{ width: isSidebar ? sidebarWidth - 30 : 0 }}
        transition={isSidebarResizing ? { duration: 0 } : navAnimations.spacer}
        className='shrink-0 overflow-hidden'
      />

      {/* Navbar items: flex container for navbar icons */}
      <motion.div
        key={chatSidebarState}
        initial={navAnimations.navItems.initial}
        animate={{ opacity: 1 }}
        transition={navAnimations.navItems.transition}
        className='flex shrink-0 items-center gap-x-2'
      >
        {PACE_NAVBAR_ITEMS.map((item) => (
          <NavbarIconLink
            key={item.id}
            item={item}
            href={getNavItemHref(item.path)}
            isActive={isNavItemActive(item.id, item.path)}
            onClick={handleNavItemClick}
          />
        ))}
      </motion.div>

      <motion.div
        key={`dynamic-tabs-bar-${chatSidebarState}`}
        initial={navAnimations.navItems.initial}
        animate={{ opacity: 1 }}
        transition={navAnimations.navItems.transition}
        className='flex min-w-0 flex-1 items-center'
      >
        <DynamicTabsBar />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ width: filesPanelSpacerWidth }}
        transition={isFilesPanelResizing ? NO_ANIMATION : FILES_PANEL_SPACER_TRANSITION}
        className='shrink-0'
      />
      <div className='shrink-0 pl-2'>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'text-GRAY_700 hover:text-GRAY_900 hover:bg-accent h-7.5 w-7.5 rounded-lg border-[0.75px] border-transparent p-[7px]',
            {
              'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE':
                filesPanelOpen && filesPanelPinned,
            },
          )}
          onClick={() => setFilesPanelPinned(!filesPanelPinned)}
          onMouseEnter={() => {
            cancelFilesPanelClose();
            if (!filesPanelPinned && !filesPanelOpen) toggleFilesPanel();
          }}
          title={filesPanelPinned ? 'Unpin files panel' : 'Files'}
        >
          <FolderOpenIcon size={16} className='pointer-events-none' />
        </Button>
      </div>
    </div>
  );
};

export default PaceNavbar;
