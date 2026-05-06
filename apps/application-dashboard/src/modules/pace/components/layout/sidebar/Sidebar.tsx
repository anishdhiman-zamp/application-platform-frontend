'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import SidebarFooter from '@/modules/pace/components/layout/sidebar/SidebarFooter';
import SidebarHeader from '@/modules/pace/components/layout/sidebar/SidebarHeader';
import SidebarPrimaryActions from '@/modules/pace/components/layout/sidebar/SidebarPrimaryActions';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceActionsContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { store } from '@/store';
import { SIDEBAR_TOGGLE_TRANSITION } from '@/utils/animations/sidebar.animations';

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

const Sidebar = () => {
  const { filesPanelOpen, isFilesPanelExpanded, isNavSidebarExpanded, toggleNavSidebar } = usePaceLayoutContext();
  const { selectConversation } = usePaceActionsContext();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const widthTransition = shouldReduceMotion ? { duration: 0 } : SIDEBAR_TOGGLE_TRANSITION;
  const isFilesPanelFullWidth = filesPanelOpen && isFilesPanelExpanded;
  const sidebarChatIdFromUrl =
    pathname === ROUTES_PATH.CHAT ? (searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null) : null;

  const handleSelectConversation = (id: string | null, title?: string) => {
    if (!id) return;
    if (pathname && pathname !== '/chat') {
      const bucket = store.getState().dynamicTabs.byConversation[id];
      const activeTab = bucket?.activeTabId ? bucket.tabs.find((tab) => tab.id === bucket.activeTabId) : null;
      const targetUrl = new URL(activeTab?.path ?? ROUTES_PATH.CHAT, window.location.origin);

      targetUrl.searchParams.set(SIDEBAR_CONVERSATION_ID_PARAM, id);
      router.push(`${targetUrl.pathname}${targetUrl.search}`);

      return;
    }
    selectConversation(id, title);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isNavSidebarExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      transition={widthTransition}
      className='bg-BG_GRAY_2 relative flex h-full shrink-0 flex-col overflow-hidden'
    >
      <SidebarHeader isExpanded={isNavSidebarExpanded} onToggle={toggleNavSidebar} />

      <SidebarPrimaryActions isExpanded={isNavSidebarExpanded} />

      {isNavSidebarExpanded ? (
        <ChatHistory
          onSelectConversation={handleSelectConversation}
          activeConversationId={sidebarChatIdFromUrl}
          recentLimit={5}
          viewMoreHref='/chat/history'
        />
      ) : (
        <div className='flex-1' />
      )}

      <SidebarFooter isExpanded={isNavSidebarExpanded} />
      {isFilesPanelFullWidth && (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-y-0 right-0 z-20 w-px'
          style={{ boxShadow: 'var(--SIDE_DRAWER_LEFT_SHADOW)' }}
        />
      )}
    </motion.aside>
  );
};

export default Sidebar;
