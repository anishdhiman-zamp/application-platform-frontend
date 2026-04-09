'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  FolderOpenIcon,
  MessageSquareIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { PanelRightOpen } from 'lucide-react';
import { FILES_PANEL_SPACER_TRANSITION, getNavbarAnimations, NO_ANIMATION } from 'modules/pace/pace.animations';
import type { AnimatedIconHandle } from 'modules/pace/pace.types';
import { CHAT_SIDEBAR_STATE, PaceNavbarItemId } from 'modules/pace/pace.types';
import { usePathname, useSearchParams } from 'next/navigation';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import useKeyDown from '@/hooks/useKeyDown';
import DynamicTabsBar from '@/modules/pace/components/dynamic-tabs/DynamicTabsBar';
import { getActiveTabIdFromUrl, isOnAnyTabBasePath } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import NavbarIconLink from '@/modules/pace/components/layout/NavbarIconLink';
import { PACE_NAVBAR_ITEMS, SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { dynamicTabsActions, selectActiveTabId } from '@/store/slices/dynamic-tabs.slice';

const PaceNavbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const fParam = activeTabId;
  const sParam = searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;

  const {
    chatSidebarState,
    prevChatSidebarState,
    setChatSidebarState,
    collapseSidebar,
    scheduleCollapseOnRouteChange,
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
  const { isEnabled: isAppsEnabled } = useFeatureFlag(FEATURE_FLAGS.APPS);
  const { isEnabled: isAgentsFe } = useFeatureFlag(FEATURE_FLAGS.AGENTS_FE);

  const visibleNavItems = useMemo(
    () =>
      PACE_NAVBAR_ITEMS.filter((item) => {
        if (item.featureFlag === FEATURE_FLAGS.APPS && !isAppsEnabled) return false;
        if (item.id === PaceNavbarItemId.AGENTS && !isAgentsFe) return false;

        return true;
      }),
    [isAppsEnabled, isAgentsFe],
  );

  const chatIconRef = useRef<AnimatedIconHandle>(null);
  const folderIconRef = useRef<AnimatedIconHandle>(null);

  const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;
  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isPinned = filesPanelOpen && filesPanelPinned;

  // Folder button occupies w-7.5 (30px); subtract it so the spacer
  const FOLDER_BUTTON_WIDTH_PX = 30;
  const filesPanelSpacerWidth = isPinned ? Math.max(0, filesPanelWidth - FOLDER_BUTTON_WIDTH_PX) : 0;

  const navAnimations = useMemo(
    () => getNavbarAnimations(prevChatSidebarState, chatSidebarState),
    [prevChatSidebarState, chatSidebarState],
  );

  const searchString = searchParams?.toString() ?? '';
  const isOnChatHome = pathname === ROUTES_PATH.CHAT && !fParam;

  const isNavItemActive = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return isOnChatHome && !isExpanded;
    }

    if (isOnChatHome || isExpanded || isOnAnyDynamicTab()) {
      return false;
    }

    if (pathname && isOnAnyTabBasePath(pathname) && getActiveTabIdFromUrl(pathname, searchString)) {
      return false;
    }

    if (id === PaceNavbarItemId.SETTINGS) {
      return pathname?.startsWith(ROUTES_PATH.CHAT_SETTINGS) ?? false;
    }

    if (id === PaceNavbarItemId.APPS) {
      return pathname?.startsWith(ROUTES_PATH.CHAT_APPS) ?? false;
    }

    return pathname?.includes(path) ?? false;
  };

  const getNavItemHref = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return path;
    }
    if (sParam) {
      return `${path}?s=${sParam}`;
    }

    return path;
  };

  const isChatIconDisabled = isOnChatHome && !isExpanded;

  const handleChatIconClick = useCallback(() => {
    if (isChatIconDisabled) return;
    if (isCollapsed) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [isCollapsed, isChatIconDisabled, setChatSidebarState]);

  const handleNavItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: PaceNavbarItemId) => {
      if (id === PaceNavbarItemId.HOME) {
        if (!isCollapsed) {
          if (isOnChatHome) {
            collapseSidebar();
          } else {
            scheduleCollapseOnRouteChange();
          }
        }

        return;
      }

      if (!isExpanded) return;

      const href = e.currentTarget.getAttribute('href');

      if (!href) return;

      const targetUrl = new URL(href, window.location.origin);

      const targetRouteUrl = targetUrl.pathname + (targetUrl.search || '');
      const currentRouteUrl = window.location.pathname + (window.location.search || '');
      const isSameRoute = targetRouteUrl === currentRouteUrl;

      if (isSameRoute) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
    },
    [isExpanded, isCollapsed, isOnChatHome, collapseSidebar, scheduleCollapseOnRouteChange, setChatSidebarState],
  );

  // Cmd + /: Toggle chat sidebar collapse/expand
  const handleCmdSlash = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey && !event.shiftKey && event.code === KEYBOARD_KEYS.SLASH) {
        event.preventDefault();
        if (isSidebar) {
          collapseSidebar();
        } else {
          setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
        }
      }
    },
    [isSidebar, collapseSidebar, setChatSidebarState],
  );

  useKeyDown(handleCmdSlash, [KEYBOARD_KEYS.SLASH]);

  const handleFolderButtonClick = useCallback(() => {
    if (filesPanelOpen && !filesPanelPinned) {
      setFilesPanelPinned(true);
    } else {
      toggleFilesPanel();
    }
  }, [filesPanelOpen, filesPanelPinned, setFilesPanelPinned, toggleFilesPanel]);

  useEffect(() => {
    if (!activeTabId || !pathname) return;

    const urlTabId = getActiveTabIdFromUrl(pathname, searchString);

    if (!urlTabId) {
      dispatch(dynamicTabsActions.setActiveTab(null));
    }
  }, [pathname, searchString, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to URL changes, not activeTabId changes

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
              'text-GRAY_700 hover:text-GRAY_900 hover:bg-accent h-7.5 w-7.5 rounded-lg border-[0.75px] border-transparent p-[7px] transition-colors duration-150',
              isExpanded &&
                'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
              isChatIconDisabled && 'cursor-default opacity-50 hover:bg-transparent',
            )}
            disabled={isChatIconDisabled}
            onClick={handleChatIconClick}
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
        {visibleNavItems.map((item) => (
          <NavbarIconLink
            key={item.id}
            item={item}
            href={getNavItemHref(item.id, item.path)}
            isActive={isNavItemActive(item.id, item.path)}
            onClick={(e) => handleNavItemClick(e, item.id)}
          />
        ))}
      </motion.div>

      <motion.div
        initial={false}
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
                onClick={handleFolderButtonClick}
                onMouseEnter={() => {
                  folderIconRef.current?.startAnimation();
                  cancelFilesPanelClose();
                  if (!filesPanelPinned && !filesPanelOpen) toggleFilesPanel();
                }}
                onMouseLeave={() => folderIconRef.current?.stopAnimation()}
              >
                <FolderOpenIcon ref={folderIconRef} size={16} className='pointer-events-none' />
              </Button>
            </TooltipTrigger>
            {filesPanelOpen && (
              <TooltipContent side='bottom'>{filesPanelPinned ? 'Unpin files panel' : 'Click to pin'}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PaceNavbar;
